import { useCallback, useMemo } from 'react'
import { TransactionResponse } from '@ethersproject/abstract-provider'

import { useTransactionAdder } from 'state/transactions/hooks'
import { BorrowPool, CollateralType, LenderVersion } from 'state/borrow/reducer'

import useWeb3React from 'hooks/useWeb3'
import { useGeneralLenderContract, useHolderContract } from 'hooks/useContract'
import { calculateGasMargin } from 'utils/web3'

export enum ClaimCallbackState {
  INVALID = 'INVALID',
  VALID = 'VALID',
}

export default function useClaimLenderRewardCallback(
  pool: BorrowPool,
  userHolder: string
): {
  state: ClaimCallbackState
  callback: null | (() => Promise<string>)
  error: string | null
} {
  const { chainId, account, library } = useWeb3React()
  const addTransaction = useTransactionAdder()
  const generalLenderContract = useGeneralLenderContract(pool)
  const holderContract = useHolderContract(pool, userHolder)

  const Contract = useMemo(
    () => (pool.version == LenderVersion.V3 ? holderContract : generalLenderContract),
    [pool, generalLenderContract, holderContract]
  )

  const constructCall = useCallback(async () => {
    try {
      if (!account || !chainId || !library || !Contract) {
        throw new Error('Missing dependencies.')
      }

      //because we just have two CollateralType types , i used [account] for else
      const args = CollateralType.SOLIDEX ? [[pool.lpPool], account] : [account]
      const methodName = !(pool.version == LenderVersion.V3) ? 'claimAndWithdraw' : 'claimAndWithdrawRewards'

      console.log(methodName, args)

      return {
        address: Contract.address,
        calldata: Contract.interface.encodeFunctionData(methodName, args) ?? '',
        value: 0,
      }
    } catch (error) {
      return {
        error,
      }
    }
  }, [pool, chainId, account, library, Contract])

  return useMemo(() => {
    if (!account || !chainId || !library || !Contract) {
      return {
        state: ClaimCallbackState.INVALID,
        callback: null,
        error: 'Missing dependencies',
      }
    }
    return {
      state: ClaimCallbackState.VALID,
      error: null,
      callback: async function onClaim(): Promise<string> {
        console.log('onClaim callback')
        const call = await constructCall()
        const { address, calldata, value } = call

        if ('error' in call) {
          console.error(call.error)
          if (call.error.message) {
            throw new Error(call.error.message)
          } else {
            throw new Error('Unexpected error. Could not construct calldata.')
          }
        }

        const tx = !value
          ? { from: account, to: address, data: calldata }
          : { from: account, to: address, data: calldata, value }

        console.log('Claim TRANSACTION', { tx, value })

        const estimatedGas = await library.estimateGas(tx).catch((gasError) => {
          console.debug('Gas estimate failed, trying eth_call to extract error', call)

          return library
            .call(tx)
            .then((result) => {
              console.debug('Unexpected successful call after failed estimate gas', call, gasError, result)
              return {
                error: new Error('Unexpected issue with estimating the gas. Please try again.'),
              }
            })
            .catch((callError) => {
              console.debug('Call threw an error', call, callError)
              return {
                error: new Error(callError.message), // TODO make this human readable
              }
            })
        })

        if ('error' in estimatedGas) {
          throw new Error('Unexpected error. Could not estimate gas for this transaction.')
        }

        return library
          .getSigner()
          .sendTransaction({
            ...tx,
            ...(estimatedGas ? { gasLimit: calculateGasMargin(estimatedGas) } : {}),
            // gasPrice /// TODO add gasPrice based on EIP 1559
          })
          .then((response: TransactionResponse) => {
            console.log(response)

            const summary = `Claim ${pool.composition} Lender Rewards`
            addTransaction(response, { summary })

            return response.hash
          })
          .catch((error) => {
            // if the user rejected the tx, pass this along
            if (error?.code === 4001) {
              throw new Error('Transaction rejected.')
            } else {
              // otherwise, the error was unexpected and we need to convey that
              console.error(`Transaction failed`, error, address, calldata, value)
              throw new Error(`Transaction failed: ${error.message}`)
            }
          })
      },
    }
  }, [account, chainId, library, addTransaction, constructCall, pool, Contract])
}
