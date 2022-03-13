import React, { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import { useAppDispatch } from 'state'
import { ZERO } from '@sushiswap/core-sdk'

import { useBorrowState, useCurrenciesFromPool } from 'state/borrow/hooks'
import { useWalletModalToggle } from 'state/application/hooks'
import {
  BorrowAction,
  BorrowPool,
  setAttemptingTxn,
  setShowReview,
  setBorrowState,
  TypedField,
} from 'state/borrow/reducer'
import useBorrowPage, { UserError } from 'hooks/useBorrowPage'
import useApproveCallback, { ApprovalState } from 'hooks/useApproveCallback'
import useWeb3React from 'hooks/useWeb3'
import useRpcChangerCallback from 'hooks/useRpcChangerCallback'
import { useSupportedChainId } from 'hooks/useSupportedChainId'
import useBorrowCallback from 'hooks/useBorrowCallback'

import { SupportedChainId } from 'constants/chains'

import { Card } from 'components/Card'
import ConfirmBorrowModal from 'components/TransactionConfirmationModal/ConfirmBorrow'
import InputBox from './InputBox'
import { PrimaryButton } from 'components/Button'
import { DotFlashing } from 'components/Icons'
import { CardTitle } from 'components/Title'

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
  const { account } = useWeb3React()
  const dispatch = useAppDispatch()
  const toggleWalletModal = useWalletModalToggle()
  const [payOff, setPayOff] = useState<boolean | null>(null)
  const rpcChangerCallback = useRpcChangerCallback()
  const isSupportedChainId = useSupportedChainId()
  const { collateralCurrency, borrowCurrency } = useCurrenciesFromPool(pool)
  const borrowState = useBorrowState()
  const { attemptingTxn, showReview, error: borrowStateError } = borrowState

  const [awaitingApproveConfirmation, setAwaitingApproveConfirmation] = useState<boolean>(false)
  const [txHash, setTxHash] = useState<string>('')

  const {
    typedField,
    formattedAmounts,
    parsedAmounts,
    error: userError,
  } = useBorrowPage(collateralCurrency, borrowCurrency, pool, action)

  const inputCurrency = useMemo(() => {
    return typedField === TypedField.COLLATERAL ? collateralCurrency : borrowCurrency
  }, [collateralCurrency, borrowCurrency, typedField])

  const spender = useMemo(() => {
    return action === BorrowAction.REPAY ? pool.mintHelper : pool.generalLender
  }, [pool, action])

  const [approvalState, approveCallback] = useApproveCallback(inputCurrency, spender)

  const { state: mainCallbackState, callback: mainCallback } = useBorrowCallback(
    collateralCurrency,
    borrowCurrency,
    parsedAmounts[0],
    parsedAmounts[1],
    pool,
    action,
    typedField,
    payOff
  )

  const [showApprove, showApproveLoader] = useMemo(() => {
    const show =
      inputCurrency &&
      ((action === BorrowAction.BORROW && typedField === TypedField.COLLATERAL) ||
        (action === BorrowAction.REPAY && typedField === TypedField.BORROW)) &&
      approvalState !== ApprovalState.APPROVED
    return [show, show && approvalState === ApprovalState.PENDING]
  }, [inputCurrency, action, typedField, approvalState])

  const handleApprove = async () => {
    setAwaitingApproveConfirmation(true)
    await approveCallback()
    setAwaitingApproveConfirmation(false)
  }

  const onMain = useCallback(() => {
    if (typedField === TypedField.COLLATERAL && parsedAmounts[0]?.greaterThan(ZERO)) {
      dispatch(setShowReview(true))
    }
    if (typedField === TypedField.BORROW && parsedAmounts[1]?.greaterThan(ZERO)) {
      dispatch(setShowReview(true))
    }
  }, [dispatch, typedField, parsedAmounts])

  const handleMain = useCallback(async () => {
    if (!mainCallback) return
    dispatch(setAttemptingTxn(true))

    let error = ''
    try {
      const txHash = await mainCallback()
      setTxHash(txHash)
    } catch (e) {
      if (e instanceof Error) {
        error = e.message
      } else {
        console.error(e)
        error = 'An unknown error occurred.'
      }
    }

    dispatch(setBorrowState({ ...borrowState, error, attemptingTxn: false }))
  }, [dispatch, mainCallback, borrowState])

  const handleOnDismiss = useCallback(() => {
    setTxHash('')
    dispatch(setBorrowState({ ...borrowState, showReview: false, attemptingTxn: false, error: undefined }))
  }, [dispatch, borrowState])

  function getApproveButton(): JSX.Element | null {
    if (!isSupportedChainId || !account || userError !== UserError.VALID) {
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
      return <PrimaryButton onClick={handleApprove}>Allow us to spend {inputCurrency?.symbol}</PrimaryButton>
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
    if (!isSupportedChainId) {
      return <PrimaryButton onClick={() => rpcChangerCallback(SupportedChainId.FANTOM)}>Switch to Fantom</PrimaryButton>
    }
    //TODO
    // if (userError === UserError.BALANCE) {
    //   return <PrimaryButton disabled>Insufficient {inputCurrency?.symbol} Balance</PrimaryButton>
    // }
    return (
      <PrimaryButton onClick={onMain}>
        {typedField === TypedField.COLLATERAL && action === BorrowAction.BORROW
          ? `DEPOSIT ${collateralCurrency?.symbol}`
          : typedField === TypedField.COLLATERAL && typedField === TypedField.COLLATERAL
          ? `WITHDRAW ${collateralCurrency?.symbol}`
          : typedField === TypedField.BORROW && action === BorrowAction.BORROW
          ? `BORROW ${borrowCurrency?.symbol}`
          : `REPAY ${borrowCurrency?.symbol}`}
      </PrimaryButton>
    )
  }

  return (
    <Wrapper>
      <Panel>
        <CardTitle>{action === BorrowAction.BORROW ? 'Deposit Collateral' : 'Withdraw Collateral'}</CardTitle>
        <InputBox
          currency={collateralCurrency}
          pool={pool}
          action={action}
          isCollateralCurrency
          value={formattedAmounts[0]}
          onChange={(value) => {
            dispatch(setBorrowState({ ...borrowState, typedValue: value || '', typedField: TypedField.COLLATERAL }))
          }}
        />
      </Panel>
      <Panel>
        <CardTitle>
          {action === BorrowAction.BORROW ? `Borrow ${borrowCurrency?.symbol}` : `Repay ${borrowCurrency?.symbol}`}
        </CardTitle>
        <InputBox
          currency={borrowCurrency}
          pool={pool}
          action={action}
          isBorrowCurrency
          value={formattedAmounts[1]}
          onMax={(x: boolean) => setPayOff(x)}
          onChange={(value) => {
            dispatch(setBorrowState({ ...borrowState, typedValue: value || '', typedField: TypedField.BORROW }))
            setPayOff(false)
          }}
        />
      </Panel>
      {getApproveButton()}
      {getActionButton()}
      <ConfirmBorrowModal
        isOpen={showReview}
        onDismiss={handleOnDismiss}
        onConfirm={handleMain}
        attemptingTxn={attemptingTxn}
        txHash={txHash}
        errorMessage={borrowStateError}
        currency={inputCurrency}
        pool={pool}
        amount={typedField === TypedField.COLLATERAL ? parsedAmounts[0] : parsedAmounts[1]}
        action={action}
        typedField={typedField}
      />
    </Wrapper>
  )
}
