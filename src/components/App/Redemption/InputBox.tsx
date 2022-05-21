import React, { useCallback, useMemo } from 'react'
import styled from 'styled-components'
import { Currency } from '@sushiswap/core-sdk'
import { isMobile } from 'react-device-detect'
import { DollarSign } from 'react-feather'

import useCurrencyLogo from 'hooks/useCurrencyLogo'
import useWeb3React from 'hooks/useWeb3'
import { useCurrencyBalance } from 'state/wallet/hooks'
import { maxAmountSpend } from 'utils/currency'

import ImageWithFallback from 'components/ImageWithFallback'
import Box from 'components/Box'
import { NumericalInput } from 'components/Input'
import { RowBetween } from '../../Row/index'

const Wrapper = styled(Box)`
  justify-content: space-between;
  align-items: flex-start;
  height: 70px;
  gap: 10px;
  padding: 0.6rem;
  align-items: center;

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
  align-items: flex-start;
  gap: 10px;
  font-size: 1.5rem;
  align-items: center;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    gap: 3px;
  `}
`

const SignWrap = styled(RowBetween)`
  width: 25px;
  height: 25px;
  padding: 3px;
  border-radius: 25px;
  border: 1px solid;
  align-items: center;
  box-shadow: 0px 0px 4px 0px #ddd;
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
    color: ${({ theme }) => theme.text1};

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
  value,
  onChange,
}: {
  currency: Currency
  value: string
  onChange(values: string): void
}) {
  const { account } = useWeb3React()
  const logo = useCurrencyLogo(currency?.wrapped.address)
  const currencyBalance = useCurrencyBalance(account ?? undefined, currency ?? undefined)

  const [balanceExact, balanceDisplay] = useMemo(() => {
    return [maxAmountSpend(currencyBalance)?.toExact(), currencyBalance?.toSignificant(6)]
  }, [currencyBalance])

  const handleClick = useCallback(() => {
    if (!balanceExact || !onChange) return
    onChange(balanceExact)
  }, [balanceExact, onChange])

  function getImageSize() {
    return isMobile ? 25 : 40
  }

  return (
    <>
      <Wrapper>
        <Column>
          <Row>
            <ImageWithFallback
              src={logo}
              width={getImageSize()}
              height={getImageSize()}
              alt={`${currency?.symbol} Logo`}
              round
            />
            {currency?.symbol}
          </Row>
          {currency?.symbol != 'DEUS' ? (
            <Balance onClick={handleClick}>
              {balanceDisplay ? balanceDisplay : '0.00'} {currency?.symbol}
              <span>MAX</span>
            </Balance>
          ) : null}
        </Column>

        {currency?.symbol == 'DEUS' && (
          <SignWrap>
            <DollarSign color="#F3B71E" size={'20px'} />
          </SignWrap>
        )}
        <NumericalInput
          value={value || ''}
          onUserInput={onChange}
          placeholder="Enter an amount"
          autoFocus
          style={{ textAlign: 'right', height: '50px', fontSize: '1.3rem' }}
        />
      </Wrapper>
    </>
  )
}
