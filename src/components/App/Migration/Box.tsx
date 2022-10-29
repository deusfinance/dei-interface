import React from 'react'
import styled from 'styled-components'
import { Currency, Token } from '@sushiswap/core-sdk'
import { isMobile } from 'react-device-detect'

import { ArrowRight } from 'react-feather'
import useCurrencyLogo from 'hooks/useCurrencyLogo'

import ImageWithFallback from 'components/ImageWithFallback'
import { Row, RowStart } from 'components/Row'
import LeverageArrow from './LeverageArrow'

const Container = styled.div<{ active?: boolean }>`
  height: 80px;
  width: 320px;
  background: ${({ theme, active }) => (active ? theme.deiColor : theme.border1)};
  padding: 2px;
  border-radius: 12px;
  cursor: ${({ active }) => (active ? 'default' : 'pointer')};
`

const Wrapper = styled(Row)<{ active?: boolean }>`
  width: 100%;
  height: 100%;
  white-space: nowrap;
  border-radius: 12px;
  color: ${({ theme }) => theme.text2};
  background: ${({ theme, active }) => (active ? theme.bg2 : theme.bg1)};
`

const CurrencyWrapper = styled(RowStart)`
  gap: 12px;
  margin-left: 20px;
`

const CurrencySymbol = styled.div<{ isSmall?: boolean }>`
  font-weight: 600;
  text-align: right;
  color: ${({ theme }) => theme.text1};
  font-size: ${({ isSmall }) => (isSmall ? '15px' : '16px')};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 12px;
    margin-left: 6px;
  `}
`

export const getImageSize = () => {
  return isMobile ? 35 : 36
}

export default function Box({
  index,
  currencyFrom,
  currencyTo,
  active,
  leverage,
  arrowDirection,
  onTokenSelect,
}: {
  index: number
  currencyFrom: Currency
  currencyTo: Currency
  active: boolean
  leverage: number
  arrowDirection?: string
  onTokenSelect: (value: number) => void
}) {
  const logoFrom = useCurrencyLogo((currencyFrom as Token)?.address)
  const logoTo = useCurrencyLogo((currencyTo as Token)?.address)

  // console.log(currencyFrom?.symbol === 'legacyDEI' || currencyTo?.symbol === 'legacyDEI')

  return (
    <Container active={active} onClick={() => onTokenSelect(index)}>
      <Wrapper active={active}>
        <CurrencyWrapper>
          <ImageWithFallback
            src={logoFrom}
            width={getImageSize()}
            height={getImageSize()}
            alt={`${currencyFrom?.symbol} Logo`}
            round
          />

          <CurrencySymbol isSmall={currencyFrom?.symbol === 'legacyDEI'}>{currencyFrom?.symbol}</CurrencySymbol>
        </CurrencyWrapper>

        {leverage === 1 ? (
          <ArrowRight style={{ color: '#EBEBEC', minWidth: '28px' }} />
        ) : (
          <LeverageArrow leverage={leverage} arrowDirection={'right'} />
        )}

        <CurrencyWrapper>
          <CurrencySymbol isSmall={currencyTo?.symbol === 'legacyDEI'}>{currencyTo?.symbol}</CurrencySymbol>

          <ImageWithFallback
            src={logoTo}
            width={getImageSize()}
            height={getImageSize()}
            alt={`${currencyTo?.symbol} Logo`}
            round
          />
        </CurrencyWrapper>
      </Wrapper>
    </Container>
  )
}
