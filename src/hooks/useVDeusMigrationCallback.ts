import { useCallback, useMemo } from 'react'
import { TransactionResponse } from '@ethersproject/abstract-provider'
import toast from 'react-hot-toast'

import { INFO_URL } from 'constants/misc'
import { calculateGasMargin } from 'utils/web3'
import { DefaultHandlerError } from 'utils/parseError'
import { makeHttpRequest } from 'utils/http'
import { toBN } from 'utils/numbers'

import { useTransactionAdder } from 'state/transactions/hooks'
import useWeb3React from 'hooks/useWeb3'
import { useVDeusMigratorContract } from 'hooks/useContract'

export enum TransactionCallbackState {
  INVALID = 'INVALID',
  VALID = 'VALID',
}

export default function useVDeusMigrationCallback(tokenIds: number[] | undefined | null): {
  state: TransactionCallbackState
  callback: null | (() => Promise<string>)
  error: string | null
} {
  const { account, chainId, library } = useWeb3React()
  const addTransaction = useTransactionAdder()
  const VDeusMigrator = useVDeusMigratorContract()

  const merkleProofRequest = useCallback(async () => {
    try {
      if (!tokenIds || !tokenIds.length) throw new Error(`tokenId didn't selected`)
      const { href: url } = new URL(`/vdeus-migration/proof/${tokenIds.join(',')}/`, INFO_URL) //TODO
      return makeHttpRequest(url)
    } catch (err) {
      throw err
    }
  }, [tokenIds])

  const constructCall = useCallback(async () => {
    try {
      if (!account || !library || !VDeusMigrator || !tokenIds || !tokenIds.length) {
        throw new Error('Missing dependencies.')
      }

      const methodName = tokenIds.length > 1 ? 'claimMany' : 'claim'
      const merkleProofResponse = await merkleProofRequest()
      const amounts = tokenIds.map((tokenId) => toBN(merkleProofResponse[tokenId.toString()]['amount']).toString())
      const merkleProof = tokenIds.map((tokenId) => merkleProofResponse[tokenId.toString()]['proof'])

      const args = tokenIds.length > 1 ? [tokenIds, amounts, merkleProof] : [tokenIds[0], amounts[0], merkleProof[0]]

      return {
        address: VDeusMigrator.address,
        calldata: VDeusMigrator.interface.encodeFunctionData(methodName, args) ?? '',
        value: 0,
      }
    } catch (error) {
      return {
        error,
      }
    }
  }, [account, library, VDeusMigrator, tokenIds, merkleProofRequest])

  return useMemo(() => {
    if (!account || !chainId || !library || !VDeusMigrator || !tokenIds || !tokenIds.length) {
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
            const summary = `Migrate vDEUS #${tokenIds.join(',#')}`
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
  }, [account, chainId, library, addTransaction, constructCall, VDeusMigrator, tokenIds])
}
