import React, { useMemo } from 'react'
import styled, { useTheme } from 'styled-components'
import { Currency, CurrencyAmount, NativeCurrency, Token } from '@sushiswap/core-sdk'
import ReactTooltip from 'react-tooltip'

import useCurrencyLogo from 'hooks/useCurrencyLogo'
import { formatDollarAmount } from 'utils/numbers'
import { PrimaryButton } from 'components/Button'
import { IconWrapper, ChevronDown, Info } from 'components/Icons'
import TransactionConfirmationModal, { ConfirmationContent, TransactionErrorContent } from './index'
import ImageWithFallback from 'components/ImageWithFallback'
import { BorrowAction, BorrowPool, TypedField } from 'state/borrow/reducer'
import { DualImageWrapper } from 'components/DualImage'
import { useGlobalPoolData, useLiquidationPrice } from 'hooks/usePoolData'

const MainWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  gap: 0.5rem;
  padding: 1.5rem 1.25rem;
  overflow: visible;
`

const BottomWrapper = styled(MainWrapper)`
  gap: 0.5rem;
`

const CurrencyRow = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  background: ${({ theme }) => theme.bg1};
  padding: 0.5rem 0;
  border-radius: 10px;

  & > * {
    &:last-child {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-weight: bold;
    }
  }
`

const InfoRow = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  gap: 5px;
  font-size: 0.8rem;
  overflow: visible;

  & > * {
    overflow: visible;
    position: relative;
    z-index: 0;
    &:last-child {
      color: ${({ theme }) => theme.text3};
    }
  }
`

const Disclaimer = styled.div`
  display: block;
  align-text: center;
  text-align: center;
  font-size: 0.7rem;
  border-radius: 5px;
  padding: 0.7rem;
`

export default function ConfirmBorrow({
  isOpen,
  onDismiss,
  onConfirm,
  attemptingTxn,
  txHash,
  errorMessage,
  currency,
  pool,
  amount,
  typedField,
  action,
}: {
  isOpen: boolean
  onDismiss: () => void
  onConfirm: () => void
  attemptingTxn: boolean
  txHash: string
  errorMessage?: string
  currency: Currency | undefined
  pool: BorrowPool
  amount: CurrencyAmount<NativeCurrency | Token> | null | undefined
  typedField: TypedField
  action: BorrowAction
}) {
  const isBorrowCurrency = useMemo(() => typedField === TypedField.BORROW, [typedField])
  const logo0 = useCurrencyLogo(isBorrowCurrency ? currency?.wrapped.address : pool.token0.address)
  const logo1 = useCurrencyLogo(pool ? pool.token1.address : undefined)
  const liquidationPrice = useLiquidationPrice(pool)
  const { borrowFee } = useGlobalPoolData(pool)

  const method = useMemo(() => {
    return action === BorrowAction.BORROW && isBorrowCurrency
      ? `Borrow ${currency?.symbol}`
      : action === BorrowAction.BORROW
      ? 'Deposit collateral'
      : isBorrowCurrency
      ? `Repay ${currency?.symbol}`
      : 'Withdraw collateral'
  }, [action, currency, isBorrowCurrency])

  const summary = useMemo(() => {
    const type =
      action === BorrowAction.BORROW && isBorrowCurrency
        ? 'Borrow'
        : action === BorrowAction.BORROW
        ? 'Deposit'
        : isBorrowCurrency
        ? 'Repay'
        : 'Withdraw'
    return `${type} ${amount?.toSignificant()} ${currency?.symbol}`
  }, [action, currency, isBorrowCurrency])

  function getImage() {
    if (!isBorrowCurrency) {
      return (
        <DualImageWrapper>
          <ImageWithFallback src={logo0} width={30} height={30} alt={`${pool.token0.symbol} Logo`} round />
          <ImageWithFallback src={logo1} width={30} height={30} alt={`${pool.token1.symbol} Logo`} round />
        </DualImageWrapper>
      )
    }
    return <ImageWithFallback src={logo0} width={30} height={30} alt={`${currency?.symbol} Logo`} round />
  }

  function getConfirmationContent() {
    return (
      <ConfirmationContent
        title="Confirm Action"
        onDismiss={onDismiss}
        mainContent={
          <MainWrapper>
            <CurrencyRow>
              <div>{getImage()}</div>
              <div>{currency?.symbol}</div>
            </CurrencyRow>
            <InfoRow>
              <div>Action</div>
              <div>{method}</div>
            </InfoRow>
            <InfoRow>
              <div>Amount</div>
              <div>{amount?.toSignificant(6)}</div>
            </InfoRow>
            <InfoRow>
              <div>Est. Liquidation Price</div>
              <div>{liquidationPrice}</div>
            </InfoRow>
            <InfoRow>
              <div>Borrow Fee</div>
              <div>{borrowFee.divide(100).toSignificant()}%</div>
            </InfoRow>
          </MainWrapper>
        }
        bottomContent={
          <BottomWrapper>
            <Disclaimer>
              You are about to {method}. By confirming this transaction you acknowledge you know what you are doing and
              are aware of the risks involved.
            </Disclaimer>
            <PrimaryButton onClick={onConfirm}>Confirm</PrimaryButton>
          </BottomWrapper>
        }
      />
    )
  }

  return (
    <TransactionConfirmationModal
      isOpen={isOpen}
      onDismiss={onDismiss}
      attemptingTxn={attemptingTxn}
      hash={txHash}
      summary={summary}
      currencyToAdd={currency}
      content={
        errorMessage ? (
          <TransactionErrorContent onDismiss={onDismiss} message={errorMessage} />
        ) : (
          getConfirmationContent()
        )
      }
    />
  )
}
