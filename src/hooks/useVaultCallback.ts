import { useVaultContract } from 'hooks/useContract'
import useWeb3React from 'hooks/useWeb3'
import { BigNumber } from '@ethersproject/bignumber'
import { useTransactionAdder } from 'state/transactions/hooks'
import { useCallback, useMemo } from 'react'
import { calculateGasMargin } from 'utils/web3'
import { TransactionResponse } from '@ethersproject/abstract-provider'

export enum VaultCallbackState {
  INVALID = 'INVALID',
  VALID = 'VALID',
}

export enum VaultAction {
  SELL = 'sell',
}

export function useVaultCallback(tokenId: BigNumber, action: VaultAction) {
  const { chainId, account, library } = useWeb3React()
  const addTransaction = useTransactionAdder()
  const VaultContract = useVaultContract()
  const constructCall = useCallback(() => {
    try {
      if (!account || !chainId || !library || !VaultContract) {
        throw new Error('Missing dependencies.')
      }

      let args = [tokenId]
      let methodName = ''

      if (action === VaultAction.SELL) {
        if (!tokenId) throw new Error('Missing tokenId.')
        args = [tokenId]
        methodName = 'sell'
      }

      return {
        address: VaultContract.address,
        calldata: VaultContract.interface.encodeFunctionData(methodName, args) ?? '',
        value: 0,
      }
    } catch (error) {
      return {
        error,
      }
    }
  }, [account, chainId, library, VaultContract, tokenId, action])

  return useMemo(() => {
    if (!account || !chainId || !library || !VaultContract) {
      return {
        state: VaultCallbackState.INVALID,
        callback: null,
        error: 'Missing dependencies',
      }
    }
    if (!tokenId) {
      return {
        state: VaultCallbackState.INVALID,
        callback: null,
        error: 'No tokenId provided',
      }
    }

    return {
      state: VaultCallbackState.VALID,
      error: null,
      callback: async function onTrade(): Promise<string> {
        const call = constructCall()
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

        console.log('VAULT TRANSACTION', { tx, value })

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
            console.log('response')
            console.log(response)

            const summary = action === VaultAction.SELL ? `Sell #${tokenId.toNumber()}` : 'Unknown Transaction'

            addTransaction(response, { summary })

            return response.hash
          })
          .catch((error) => {
            console.log('tx error')
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
  }, [account, chainId, library, VaultContract, tokenId, constructCall, action, addTransaction])
}
