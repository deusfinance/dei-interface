import React from 'react'
import styled from 'styled-components'
import { Currency, Token } from '@sushiswap/core-sdk'
import { isMobile } from 'react-device-detect'

import { ArrowRight } from 'react-feather'
import useCurrencyLogo from 'hooks/useCurrencyLogo'

import ImageWithFallback from 'components/ImageWithFallback'
import { Row, RowBetween } from 'components/Row'
import LeverageArrow from './LeverageArrow'

const Container = styled.div<{ active?: boolean }>`
  height: 80px;
  width: 320px;
  background: ${({ theme, active }) => (active ? theme.deiColor : theme.border1)};
  padding: 2px;
  border-radius: 12px;
`

const Wrapper = styled(Row)<{ active?: boolean }>`
  width: 100%;
  height: 100%;
  white-space: nowrap;
  border-radius: 12px;
  color: ${({ theme }) => theme.text2};
  background: ${({ theme, active }) => (active ? theme.bg2 : theme.bg1)};
  cursor: ${({ active }) => (active ? 'default' : 'pointer')};

  /* ${({ theme }) => theme.mediaWidth.upToSmall`
    height: 65px;
  `} */
`

const CurrencyWrapper = styled(RowBetween)`
  margin: 0px 25px;
`

const CurrencySymbol = styled.div`
  font-weight: 600;
  font-size: 16px;
  text-align: right;
  color: ${({ theme }) => theme.text1};

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
  leverage?: number
  arrowDirection?: string
  onTokenSelect: (value: number) => void
}) {
  const logoFrom = useCurrencyLogo((currencyFrom as Token)?.address)
  const logoTo = useCurrencyLogo((currencyTo as Token)?.address)

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

          <CurrencySymbol>{currencyFrom?.symbol}</CurrencySymbol>
        </CurrencyWrapper>

        {!leverage ? (
          <ArrowRight style={{ color: '#EBEBEC', minWidth: '52px' }} />
        ) : (
          <LeverageArrow leverage={leverage} arrowDirection={'right'} />
        )}

        <CurrencyWrapper>
          <CurrencySymbol>{currencyTo?.symbol}</CurrencySymbol>

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
