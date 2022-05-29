import { toast } from 'react-hot-toast'
import { BigNumber } from '@ethersproject/bignumber'
import { TransactionResponse } from '@ethersproject/abstract-provider'

import { DefaultHandlerError } from 'utils/parseError'

export function calculateGasMargin(value: BigNumber): BigNumber {
  return value.mul(BigNumber.from(10000 + 2000)).div(BigNumber.from(10000))
}

//callback function for sending transaction to wallet providers
export async function createTransactionCallback(
  methodName: string,
  constructCall: () =>
    | { address: string; calldata: string; value: number; error?: undefined }
    | { address?: undefined; calldata?: undefined; value?: undefined; error: any }
    | Promise<any>,
  addTransaction: any,
  account: undefined | null | string,
  library: any,
  summary: string
) {
  console.log(`on${methodName} callback`)
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

  console.log(methodName.toUpperCase() + ' TRANSACTION', { tx, value })
  const isForceEnabled = false
  let estimatedGas = await library.estimateGas(tx).catch((gasError: any) => {
    console.debug('Gas estimate failed, trying eth_call to extract error', call)

    return library
      .call(tx)
      .then((result: any) => {
        console.debug('Unexpected successful call after failed estimate gas', call, gasError, result)
        return {
          error: new Error('Unexpected issue with estimating the gas. Please try again.'),
        }
      })
      .catch((callError: any) => {
        console.debug('Call threw an error', call, callError)
        toast.error(DefaultHandlerError(callError))
        return {
          error: new Error(callError.message), // TODO make this human readable
        }
      })
  })

  if ('error' in estimatedGas) {
    if (isForceEnabled) {
      estimatedGas = BigNumber.from(500_000)
    } else {
      throw new Error('Unexpected error. Could not estimate gas for this transaction.')
    }
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
      addTransaction(response, { summary })

      return response.hash
    })
    .catch((error: any) => {
      // if the user rejected the tx, pass this along
      if (error?.code === 4001) {
        throw new Error('Transaction rejected.')
      } else {
        // otherwise, the error was unexpected and we need to convey that
        console.error(`Transaction failed`, error, address, calldata, value)
        throw new Error(`Transaction failed: ${error.message}`)
      }
    })
}
