import { useCallback, useMemo } from 'react'
import { TransactionResponse } from '@ethersproject/abstract-provider'
import toast from 'react-hot-toast'

import { INFO_URL } from 'constants/misc'
import { calculateGasMargin } from 'utils/web3'
import { DefaultHandlerError } from 'utils/parseError'
import { makeHttpRequest } from 'utils/http'

import { useTransactionAdder } from 'state/transactions/hooks'
import useWeb3React from 'hooks/useWeb3'
import { useMigratorContract } from 'hooks/useContract'
import { TransactionCallbackState } from 'hooks/useSwapCallback'
import { toHex } from 'utils/hex'
import { CurrencyAmount, NativeCurrency, Token } from '@sushiswap/core-sdk'
// import { parseUnits } from '@ethersproject/units'
// import { BDEI_TOKEN } from 'constants/tokens'
import { MigrationStateType } from 'constants/migration'

export default function useMigrationCallback(
  migrationState: MigrationStateType,
  amount: CurrencyAmount<NativeCurrency | Token> | null | undefined
): {
  state: TransactionCallbackState
  callback: null | (() => Promise<string>)
  error: string | null
} {
  const { account, chainId, library } = useWeb3React()
  const addTransaction = useTransactionAdder()
  const migratorContract = useMigratorContract()
  const { inputToken, outputToken, proof, methodName } = migrationState

  const merkleProofRequest = useCallback(async () => {
    try {
      if (!account) throw new Error(`account didn't provided`)
      const { href: url } = new URL(`/bond-merkle/liquidity/proof/${account.toLowerCase()}/`, INFO_URL)
      return makeHttpRequest(url)
    } catch (err) {
      throw err
    }
  }, [account])

  const constructCall = useCallback(async () => {
    try {
      if (!account || !library || !migratorContract || !inputToken || !amount) {
        throw new Error('Missing dependencies.')
      }

      let args
      if (methodName === 'tokenToBDEI') {
        args = [inputToken.address, toHex(amount.quotient)]
      } else if (proof) {
        const merkleProofResponse = await merkleProofRequest()
        const merkleProof = merkleProofResponse['proof']
        const totalClaimableBDEIParsed = merkleProofResponse['value']
        // console.log({ merkleProof })
        // const totalClaimableBDEIParsed = parseUnits(totalClaimableBDEI, BDEI_TOKEN.decimals).toString()
        // const totalClaimableBDEIParsed = parseUnits(totalClaimableBDEI, BDEI_TOKEN.decimals).toString()
        args = [toHex(amount.quotient), totalClaimableBDEIParsed, merkleProof]
      } else {
        args = [toHex(amount.quotient)]
      }

      return {
        address: migratorContract.address,
        calldata: migratorContract.interface.encodeFunctionData(methodName, args) ?? '',
        value: 0,
      }
    } catch (error) {
      return {
        error,
      }
    }
  }, [account, library, migratorContract, inputToken, amount, methodName, proof, merkleProofRequest])

  return useMemo(() => {
    if (!account || !chainId || !library || !migratorContract || !inputToken || !amount) {
      return {
        state: TransactionCallbackState.INVALID,
        callback: null,
        error: 'Missing dependencies',
      }
    }

    return {
      state: TransactionCallbackState.VALID,
      error: null,
      callback: async function onMigrate(): Promise<string> {
        console.log('onMigrate callback')
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

        console.log('MIGRATE TRANSACTION', { tx, value })

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
              toast.error(DefaultHandlerError(callError))
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
            const summary = `Migrate ${amount?.toSignificant()} ${inputToken?.symbol} to ${outputToken?.symbol}`
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
  }, [
    account,
    chainId,
    library,
    migratorContract,
    inputToken,
    amount,
    constructCall,
    outputToken?.symbol,
    addTransaction,
  ])
}
