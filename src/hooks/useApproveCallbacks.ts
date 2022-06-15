import { useCallback, useMemo } from 'react'
import { TransactionResponse } from '@ethersproject/providers'
import { MaxUint256 } from '@ethersproject/constants'
import { Token } from '@sushiswap/core-sdk'

import useWeb3React from './useWeb3'

import { useTransactionAdder } from 'state/transactions/hooks'
import { calculateGasMargin } from 'utils/web3'
import { useMultipleContractSingleData } from 'state/multicall/hooks'
import ERC20_ABI from 'constants/abi/ERC20.json'
import { Interface } from '@ethersproject/abi'
import { getContract } from './useContract'

export enum ApprovalState {
  UNKNOWN = 'UNKNOWN',
  NOT_APPROVED = 'NOT_APPROVED',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
}

export default function useApproveCallbacks(
  currencies: Token[],
  spender: string | undefined
): [ApprovalState[], (index: number | null) => Promise<void>] {
  const { library, account, chainId } = useWeb3React()

  const addTransaction = useTransactionAdder()
  //   TODO: add pending approval
  // const pendingApproval = useHasPendingApproval(token?.address, spender)

  const contracts = currencies.map((currency) => currency.address)
  const allowances = useMultipleContractSingleData(contracts, new Interface(ERC20_ABI), 'allowance', [
    account ?? undefined,
    spender,
  ])

  const approvalStates = useMemo(() => {
    return currencies.map((currency, index) => {
      const currencyResult = allowances[index]?.result

      if (!currency) return ApprovalState.UNKNOWN
      if (!spender) return ApprovalState.UNKNOWN
      if (currency.isNative) return ApprovalState.APPROVED
      if (!currencyResult?.length) return ApprovalState.UNKNOWN

      return currencyResult[0].gt(0) ? ApprovalState.APPROVED : ApprovalState.NOT_APPROVED
    })
  }, [currencies, spender, allowances])

  const handleApproveByIndex = useCallback(
    async (index) => {
      const approvalState = approvalStates[index]
      const token = currencies[index]

      // if (approvalState === ApprovalState.APPROVED || approvalState === ApprovalState.PENDING) {
      if (!library) {
        console.error('library is null')
        return
      }

      const TokenContract = getContract(token.address, ERC20_ABI, library, account ? account : undefined)

      if (approvalState === ApprovalState.APPROVED) {
        console.error('approve was called unnecessarily')
        return
      }

      if (!chainId) {
        console.error('no chainId')
        return
      }

      if (!TokenContract) {
        console.error('TokenContract is null')
        return
      }

      if (!account) {
        console.error('account is null')
        return
      }

      if (!spender) {
        console.error('no spender')
        return
      }

      const estimatedGas = await TokenContract.estimateGas.approve(spender, MaxUint256)
      return TokenContract.approve(spender, MaxUint256, {
        gasLimit: calculateGasMargin(estimatedGas),
      })
        .then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: 'Approve ' + token?.symbol,
            approval: { tokenAddress: token?.address, spender },
          })
        })
        .catch((error: Error) => {
          console.error('Failed to approve token for an unknown reason', error)
        })
    },
    [currencies, spender, addTransaction, chainId, account, library, approvalStates]
  )

  return [approvalStates, handleApproveByIndex]
}
