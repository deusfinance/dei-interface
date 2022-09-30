import { useCallback, useMemo } from 'react'
import { TransactionResponse } from '@ethersproject/abstract-provider'
import toast from 'react-hot-toast'

// import { INFO_URL } from 'constants/misc'
import { calculateGasMargin } from 'utils/web3'
import { DefaultHandlerError } from 'utils/parseError'
// import { makeHttpRequest } from 'utils/http'

import { useTransactionAdder } from 'state/transactions/hooks'
import useWeb3React from 'hooks/useWeb3'
import { useDeiBonderV3Contract } from 'hooks/useContract'
import { TransactionCallbackState } from 'hooks/useSwapCallback'
import { toHex } from 'utils/hex'
import { Currency, CurrencyAmount, NativeCurrency, Token } from '@sushiswap/core-sdk'

export default function useMigrationCallback(
  inputCurrency: Currency | undefined | null,
  amount: CurrencyAmount<NativeCurrency | Token> | null | undefined
): {
  state: TransactionCallbackState
  callback: null | (() => Promise<string>)
  error: string | null
} {
  const { account, chainId, library } = useWeb3React()
  const addTransaction = useTransactionAdder()
  const deiBonderV3Contract = useDeiBonderV3Contract()

  // const tokenIds = useMemo(() => [0], [])

  // const merkleProofRequest = useCallback(async () => {
  //   try {
  //     if (!tokenIds || !tokenIds.length) throw new Error(`tokenId didn't selected`)
  //     const { href: url } = new URL(`/vdeus-migration/proof/${tokenIds.join(',')}/`, INFO_URL) //TODO
  //     return makeHttpRequest(url)
  //   } catch (err) {
  //     throw err
  //   }
  // }, [tokenIds])

  const constructCall = useCallback(async () => {
    try {
      if (!account || !library || !deiBonderV3Contract || !inputCurrency || !amount) {
        throw new Error('Missing dependencies.')
      }

      const methodName = inputCurrency?.symbol === 'DEI' ? 'legacyDEIToBDEI' : 'vDEUSToBDEI'
      // const merkleProofResponse = await merkleProofRequest()
      // const merkleProof = tokenIds.map((tokenId) => merkleProofResponse[tokenId.toString()]['proof'])

      const args = [toHex(amount.quotient)]

      return {
        address: deiBonderV3Contract.address,
        calldata: deiBonderV3Contract.interface.encodeFunctionData(methodName, args) ?? '',
        value: 0,
      }
    } catch (error) {
      return {
        error,
      }
    }
  }, [account, library, deiBonderV3Contract, inputCurrency, amount])

  return useMemo(() => {
    if (!account || !chainId || !library || !deiBonderV3Contract || !inputCurrency || !amount) {
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
            const summary = `Migrate ${amount} ${inputCurrency?.symbol} to bDEI}`
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
  }, [account, chainId, library, deiBonderV3Contract, inputCurrency, amount, constructCall, addTransaction])
}
