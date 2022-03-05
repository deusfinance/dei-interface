import React, { useMemo, useState } from 'react'
import styled from 'styled-components'
import { useAppDispatch } from 'state'

import { useBorrowState, useCurrenciesFromPool } from 'state/borrow/hooks'
import { useWalletModalToggle } from 'state/application/hooks'
import { BorrowAction, BorrowPool, setUserState, TypedField } from 'state/borrow/reducer'
import useBorrowPage, { UserError } from 'hooks/useBorrowPage'
import useApproveCallback, { ApprovalState } from 'hooks/useApproveCallback'
import useWeb3React from 'hooks/useWeb3'
import useRpcChangerCallback from 'hooks/useRpcChangerCallback'

import { SolidlyChains, SupportedChainId } from 'constants/chains'
import { MasterContract } from 'constants/addresses'

import { Card } from 'components/Card'
import InputBox from './InputBox'
import { PrimaryButton } from 'components/Button'
import { DotFlashing } from 'components/Icons'
import { CardTitle } from 'components/Title'
import SummaryPanel from './SummaryPanel'

const Wrapper = styled(Card)`
  gap: 15px;
`

const Panel = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  gap: 10px;

  & > * {
    &:first-child {
      font-size: 18px;
    }
  }
`

export default function Borrow({ pool, action }: { pool: BorrowPool; action: BorrowAction }) {
  const { chainId, account } = useWeb3React()
  const dispatch = useAppDispatch()
  const { collateralCurrency, pairCurrency } = useCurrenciesFromPool(pool)
  const borrowState = useBorrowState()
  const { error: borrowStateError } = borrowState
  const [awaitingApproveConfirmation, setAwaitingApproveConfirmation] = useState<boolean>(false)
  const toggleWalletModal = useWalletModalToggle()
  const rpcChangerCallback = useRpcChangerCallback()

  const [inputCurrency, outputCurrency] = useMemo(() => {
    const borrow = [collateralCurrency, pairCurrency]
    return action === BorrowAction.BORROW ? borrow : borrow.reverse()
  }, [collateralCurrency, pairCurrency, action])

  const { formattedAmounts, parsedAmounts, error: userError } = useBorrowPage(collateralCurrency, pairCurrency, action)

  // Allow user to connect any chain globally, but restrict unsupported ones on this page
  const isSupportedChainId: boolean = useMemo(() => {
    if (!chainId || !account) return false
    return SolidlyChains.includes(chainId)
  }, [chainId, account])

  const spender = useMemo(() => {
    if (!isSupportedChainId || !chainId) {
      return undefined
    }
    return MasterContract[chainId]
  }, [isSupportedChainId, chainId])

  const [approvalState, approveCallback] = useApproveCallback(inputCurrency, spender)

  const [showApprove, showApproveLoader] = useMemo(() => {
    const show = inputCurrency && approvalState !== ApprovalState.APPROVED
    return [show, show && approvalState === ApprovalState.PENDING]
  }, [inputCurrency, approvalState])

  const handleApprove = async () => {
    setAwaitingApproveConfirmation(true)
    await approveCallback()
    setAwaitingApproveConfirmation(false)
  }

  // TODO implement this
  const handleMain = async () => {
    setAwaitingApproveConfirmation(true)
    await approveCallback()
    setAwaitingApproveConfirmation(false)
  }

  function getApproveButton(): JSX.Element | null {
    if (!isSupportedChainId || !account || userError !== UserError.VALID || !formattedAmounts[0]) {
      return null
    }

    if (awaitingApproveConfirmation) {
      return (
        <PrimaryButton active>
          Awaiting Confirmation <DotFlashing style={{ marginLeft: '10px' }} />
        </PrimaryButton>
      )
    }
    if (showApproveLoader) {
      return (
        <PrimaryButton active>
          Approving <DotFlashing style={{ marginLeft: '10px' }} />
        </PrimaryButton>
      )
    }
    if (showApprove) {
      return <PrimaryButton onClick={handleApprove}>Approve {inputCurrency?.symbol}</PrimaryButton>
    }
    return null
  }

  function getActionButton(): JSX.Element | null {
    if (!!getApproveButton()) {
      return null
    }
    if (userError === UserError.ACCOUNT) {
      return <PrimaryButton onClick={toggleWalletModal}>Connect Wallet</PrimaryButton>
    }
    if (!isSupportedChainId) {
      return <PrimaryButton onClick={() => rpcChangerCallback(SupportedChainId.FANTOM)}>Switch to Fantom</PrimaryButton>
    }
    if (userError === UserError.BALANCE) {
      return <PrimaryButton disabled>Insufficient {inputCurrency?.symbol} Balance</PrimaryButton>
    }
    return (
      <PrimaryButton onClick={handleMain}>
        {action.toUpperCase()} {pairCurrency?.symbol}
      </PrimaryButton>
    )
  }

  return (
    <Wrapper>
      <Panel>
        <CardTitle>{action === BorrowAction.BORROW ? 'Deposit Collateral' : `Repay ${pairCurrency?.symbol}`}</CardTitle>
        <InputBox
          currency={inputCurrency}
          value={formattedAmounts[0]}
          onChange={(value) => {
            dispatch(setUserState({ ...borrowState, typedValue: value || '', typedField: TypedField.A }))
          }}
        />
      </Panel>
      <Panel>
        <CardTitle>{action === BorrowAction.BORROW ? `Borrow ${pairCurrency?.symbol}` : 'Remove Collateral'}</CardTitle>
        <InputBox
          currency={outputCurrency}
          value={formattedAmounts[1]}
          onChange={(value) => {
            dispatch(setUserState({ ...borrowState, typedValue: value || '', typedField: TypedField.B }))
          }}
        />
      </Panel>
      <Panel>
        <SummaryPanel pool={pool} />
      </Panel>
      {getApproveButton()}
      {getActionButton()}
    </Wrapper>
  )
}
