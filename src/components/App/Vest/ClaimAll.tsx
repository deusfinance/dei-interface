import React, { useState, useMemo, useCallback } from 'react'
import styled from 'styled-components'
import toast from 'react-hot-toast'

import useWeb3React from 'hooks/useWeb3'
import { useVeDistContract } from 'hooks/useContract'

import { formatAmount } from 'utils/numbers'
import { DefaultHandlerError } from 'utils/parseError'
import { useIsTransactionPending, useTransactionAdder } from 'state/transactions/hooks'

import { PrimaryButton } from 'components/Button'
import { useSupportedChainId } from 'hooks/useSupportedChainId'
import { DotFlashing } from 'components/Icons'

const ActionButton = styled(PrimaryButton)`
  padding: 0 5px;
  line-height: 1.2rem;
  height: 55px;
`

export default function ClaimAll({ nftIds, rewards }: { nftIds: number[]; rewards: number[] }) {
  const { account } = useWeb3React()

  const veDistContract = useVeDistContract()
  const addTransaction = useTransactionAdder()
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false)
  const isSupportedChainId = useSupportedChainId()
  const [pendingTxHash, setPendingTxHash] = useState('')
  const showTransactionPending = useIsTransactionPending(pendingTxHash)

  //pass just unclaimed tokenIds to claimAll method
  const [unClaimedIds, totalRewards] = useMemo(() => {
    if (!nftIds.length || !rewards.length) return [[], 0]
    let total = 0
    return [
      rewards.reduce((acc: number[], value: number, index: number) => {
        if (!value) return acc
        acc.push(nftIds[index])
        total += value
        return acc
      }, []),
      total,
    ]
  }, [nftIds, rewards])

  const onClaimAll = useCallback(async () => {
    try {
      if (!veDistContract || !account || !isSupportedChainId || !unClaimedIds.length) return
      setAwaitingConfirmation(true)
      const response = await veDistContract.claimAll(unClaimedIds)
      addTransaction(response, { summary: `Claim All veDEUS rewards`, vest: { hash: response.hash } })
      setAwaitingConfirmation(false)
      setPendingTxHash(response.hash)
    } catch (err) {
      console.log(err)
      toast.error(DefaultHandlerError(err))
      setAwaitingConfirmation(false)
      setPendingTxHash('')
    }
  }, [veDistContract, unClaimedIds, addTransaction, account, isSupportedChainId])
  function getActionButton() {
    if (awaitingConfirmation) {
      return (
        <ActionButton active>
          Confirming <DotFlashing style={{ marginLeft: '10px' }} />
        </ActionButton>
      )
    }

    if (showTransactionPending) {
      return (
        <ActionButton active>
          Claiming <DotFlashing style={{ marginLeft: '10px' }} />
        </ActionButton>
      )
    }

    if (!totalRewards) {
      return (
        <ActionButton disabled style={{ cursor: 'not-allowed  ' }}>
          Claim All
        </ActionButton>
      )
    }

    return (
      <ActionButton onClick={onClaimAll} style={{ fontSize: '0.8rem' }}>
        Claim All
        <br /> {formatAmount(totalRewards)} veDEUS
      </ActionButton>
    )
  }

  return getActionButton()
}
