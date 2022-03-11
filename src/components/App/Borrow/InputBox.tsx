import React, { useCallback, useMemo } from 'react'
import styled from 'styled-components'
import { Currency } from '@sushiswap/core-sdk'

import useCurrencyLogo from 'hooks/useCurrencyLogo'
import useWeb3React from 'hooks/useWeb3'
import { useCurrencyBalance } from 'state/wallet/hooks'
import { BorrowAction, BorrowPool } from 'state/borrow/reducer'
import { maxAmountSpend } from 'utils/currency'

import ImageWithFallback from 'components/ImageWithFallback'
import Box from 'components/Box'
import { NumericalInput } from 'components/Input'
import { DualImageWrapper } from 'components/DualImage'
import { useAvailableForWithdrawal, useUserPoolData } from 'hooks/usePoolData'
import { isMobile } from 'react-device-detect'

const Wrapper = styled(Box)`
  justify-content: space-between;
  align-items: flex-start;
  height: 70px;
  gap: 10px;
  padding: 0.6rem;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 0.5rem;
  `}
`

const Column = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
`

const Row = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  gap: 10px;
  font-size: 0.8rem;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    gap: 3px;
  `}
`

const Balance = styled(Row)`
  font-size: 0.7rem;
  text-align: center;
  margin-top: 5px;
  margin-left: 4px;
  gap: 5px;
  color: ${({ theme }) => theme.text2};

  & > span {
    background: ${({ theme }) => theme.secondary1};
    border-radius: 6px;
    padding: 2px 4px;
    font-size: 0.5rem;
    color: white;

    &:hover {
      background: ${({ theme }) => theme.secondary2};
      cursor: pointer;
    }
  }

  &:hover {
    cursor: pointer;
  }
`

export default function InputBox({
  currency,
  pool,
  action,
  isCollateralCurrency,
  isBorrowCurrency,
  value,
  onChange,
}: {
  currency: Currency | undefined
  pool: BorrowPool
  action: BorrowAction
  isCollateralCurrency?: boolean
  isBorrowCurrency?: boolean
  value: string
  onChange(x?: string): void
}) {
  const { account } = useWeb3React()
  const logo0 = useCurrencyLogo(isBorrowCurrency ? currency?.wrapped.address : pool.token0.address)
  const logo1 = useCurrencyLogo(pool ? pool.token1.address : undefined)
  const currencyBalance = useCurrencyBalance(account ?? undefined, currency ?? undefined)
  const { userBorrow } = useUserPoolData(pool)
  const availableForWithdrawal = useAvailableForWithdrawal(pool)

  const [balanceExact, balanceDisplay] = useMemo(() => {
    if (action === BorrowAction.BORROW) {
      return [maxAmountSpend(currencyBalance)?.toExact(), currencyBalance?.toSignificant(6)]
    }
    if (isCollateralCurrency) {
      return [availableForWithdrawal, parseFloat(availableForWithdrawal).toPrecision(6)]
    }
    return [userBorrow, parseFloat(userBorrow).toPrecision(6)]
  }, [action, availableForWithdrawal, userBorrow, currencyBalance, isCollateralCurrency])

  const handleClick = useCallback(() => {
    if (!balanceExact || !onChange) return
    onChange(balanceExact)
  }, [balanceExact, onChange])

  if (!currency) {
    return null
  }

  function getImageSize() {
    return isMobile ? 25 : 30
  }

  function getImage() {
    if (!isBorrowCurrency) {
      return (
        <DualImageWrapper>
          <ImageWithFallback
            src={logo0}
            width={getImageSize()}
            height={getImageSize()}
            alt={`${pool.token0.symbol} Logo`}
            round
          />
          <ImageWithFallback
            src={logo1}
            width={getImageSize()}
            height={getImageSize()}
            alt={`${pool.token1.symbol} Logo`}
            round
          />
        </DualImageWrapper>
      )
    }
    return (
      <ImageWithFallback
        src={logo0}
        width={getImageSize()}
        height={getImageSize()}
        alt={`${currency?.symbol} Logo`}
        round
      />
    )
  }

  return (
    <>
      <Wrapper>
        <Column>
          <Row>
            {getImage()}
            {currency?.symbol}
          </Row>
          {currency && (
            <Balance onClick={handleClick}>
              {balanceDisplay ? balanceDisplay : '0.00'} {currency?.symbol}
              <span>MAX</span>
            </Balance>
          )}
        </Column>
        <NumericalInput
          value={value || ''}
          onUserInput={onChange}
          placeholder={'Enter an amount'}
          autoFocus
          style={{ textAlign: 'right', height: '50px' }}
        />
      </Wrapper>
    </>
  )
}
