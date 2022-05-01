import { useEffect, useState } from 'react'

import useWeb3React from './useWeb3'

import { useHasPendingApproval, useTransactionAdder } from 'state/transactions/hooks'
import { Contract } from '@ethersproject/contracts'
import { BigNumber } from '@ethersproject/bignumber'

export enum ApprovalState {
  UNKNOWN = 'UNKNOWN',
  NOT_APPROVED = 'NOT_APPROVED',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
}

export default function useApproveNftCallback(
  tokenId: BigNumber,
  tokenAddress: string | null | undefined,
  TokenContract: Contract | null,
  spender: string | null | undefined
): [ApprovalState] {
  const { chainId, account } = useWeb3React()
  const addTransaction = useTransactionAdder()
  const [approvalState, setApprovalState] = useState<ApprovalState>(ApprovalState.UNKNOWN)
  const currentAllowance = BigNumber.from(0)
  const pendingApproval = useHasPendingApproval(tokenAddress, spender)

  useEffect(() => {
    let mounted = true
    const fn = async () => {
      if (!spender || !TokenContract) return
      const approvedAddress = await TokenContract.getApproved(tokenId)
      if (mounted) {
        setApprovalState(
          approvedAddress === spender
            ? ApprovalState.APPROVED
            : pendingApproval
            ? ApprovalState.PENDING
            : ApprovalState.NOT_APPROVED
        )
      }
    }
    fn()
    return () => {
      mounted = false
    }
  }, [spender, currentAllowance, pendingApproval, TokenContract, tokenId, account])

  // const approve = useCallback(async () => {
  //   if (approvalState === ApprovalState.APPROVED || approvalState === ApprovalState.PENDING) {
  //     console.error('approve was called unnecessarily')
  //     return
  //   }
  //
  //   if (!chainId) {
  //     console.error('no chainId')
  //     return
  //   }
  //
  //   if (!TokenContract) {
  //     console.error('TokenContract is null')
  //     return
  //   }
  //
  //   if (!account) {
  //     console.error('account is null')
  //     return
  //   }
  //
  //   if (!spender) {
  //     console.error('no spender')
  //     return
  //   }
  //
  //   const estimatedGas = await TokenContract.estimateGas.approve(spender, MaxUint256)
  //   return TokenContract.approve(spender, MaxUint256, {
  //     gasLimit: calculateGasMargin(estimatedGas),
  //   })
  //     .then((response: TransactionResponse) => {
  //       addTransaction(response, {
  //         summary: 'Approve ' + token?.symbol,
  //         approval: { tokenAddress: token?.address, spender },
  //       })
  //     })
  //     .catch((error: Error) => {
  //       console.error('Failed to approve token for an unknown reason', error)
  //     })
  // }, [approvalState, TokenContract, spender, token, addTransaction, chainId, account])

  return [approvalState]
}
