import { useCallback, useEffect, useState } from 'react'

import useWeb3React from './useWeb3'

import { useHasPendingApproval, useTransactionAdder } from 'state/transactions/hooks'
import { Contract } from '@ethersproject/contracts'
import { BigNumber } from '@ethersproject/bignumber'
import { AddressZero } from '@ethersproject/constants/src.ts/addresses'
import { calculateGasMargin } from 'utils/web3'
import { TransactionResponse } from '@ethersproject/providers'

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
): [ApprovalState, () => Promise<void>] {
  const { chainId, account } = useWeb3React()
  const addTransaction = useTransactionAdder()
  const [approvalState, setApprovalState] = useState<ApprovalState>(ApprovalState.UNKNOWN)
  const [approvedAll, setApprovedAll] = useState(false)

  const currentAllowance = BigNumber.from(0)
  const pendingApproval = useHasPendingApproval(tokenAddress, spender)

  useEffect(() => {
    let mounted = true
    const fn = async () => {
      if (!spender || !TokenContract) return
      const approvedAll = await TokenContract.isApprovedForAll(account, spender)
      if (mounted) {
        setApprovedAll(approvedAll)
      }
    }
    fn()
    return () => {
      mounted = false
    }
  }, [spender, currentAllowance, pendingApproval, TokenContract, tokenId, account])

  useEffect(() => {
    let mounted = true
    const fn = async () => {
      if (!spender || !TokenContract) return
      const approvedAddress = await TokenContract.getApproved(tokenId)
      if (mounted) {
        if (approvedAddress === spender || (approvedAddress === AddressZero && approvedAll)) {
          setApprovalState(ApprovalState.APPROVED)
        } else {
          setApprovalState(pendingApproval ? ApprovalState.PENDING : ApprovalState.NOT_APPROVED)
        }
      }
    }
    fn()
    return () => {
      mounted = false
    }
  }, [spender, currentAllowance, pendingApproval, TokenContract, tokenId, account, approvedAll])

  const approve = useCallback(async () => {
    if (approvalState === ApprovalState.APPROVED || approvalState === ApprovalState.PENDING) {
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

    if (!tokenAddress) {
      console.error('tokenAddress is null')
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
    const estimatedGas = await TokenContract.estimateGas.approve(spender, tokenId)
    return TokenContract.approve(spender, tokenId, {
      gasLimit: calculateGasMargin(estimatedGas),
    })
      .then((response: TransactionResponse) => {
        addTransaction(response, {
          summary: 'Approve #' + tokenId,
          approval: { tokenAddress, spender },
        })
      })
      .catch((error: Error) => {
        console.error('Failed to approve token for an unknown reason', error)
      })
  }, [approvalState, chainId, TokenContract, tokenAddress, account, spender, tokenId, addTransaction])

  return [approvalState, approve]
}
