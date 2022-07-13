import React, { useCallback, useMemo } from 'react'
import styled from 'styled-components'
import { Currency } from '@sushiswap/core-sdk'
import { isMobile } from 'react-device-detect'

import useCurrencyLogo from 'hooks/useCurrencyLogo'
import useWeb3React from 'hooks/useWeb3'
import { useCurrencyBalance } from 'state/wallet/hooks'
import { maxAmountSpend } from 'utils/currency'

import ImageWithFallback from 'components/ImageWithFallback'
import { NumericalInput } from 'components/Input'

const Wrapper = styled.div`
  background: rgb(28 28 28);
  border-radius: 12px;
  color: ${({ theme }) => theme.text2};
  white-space: nowrap;
  height: 80px;
  gap: 10px;
  /* padding: 0.6rem; */
  border: 1px solid #444444;
  align-items: center;
  vertical-align: middle;
  display: flex;
  flex-direction: row;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    // padding: 0.5rem;
  `}
`

const InputWrapper = styled.div`
  padding-top: 8px;
  padding-right: 16px;
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

const CurrencySymbol = styled.div`
  font-family: 'IBM Plex Mono';
  font-weight: 600;
  font-size: 16px;
  margin-left: 5px;
  color: #ccc;
`

const RightWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  border-left: 1px solid #444444;
  padding: 6px;
  height: 100%;
`

const InfoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-around;
`

const LogoWrapper = styled.div`
  padding-left: 10px;
`

const Balance = styled(Row)`
  font-size: 0.7rem;
  text-align: center;
  margin-top: 5px;
  margin-left: 4px;
  gap: 5px;
  color: ${({ theme }) => theme.text2};

  font-family: 'IBM Plex Mono';
  font-weight: 500;
  font-size: 10px;

  display: flex;
  align-items: center;
  text-align: right;

  & > span {
    background: ${({ theme }) => theme.bg2};
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
  type,
  disabled,
}: {
  currency: Currency
  value: string
  onChange(values: string): void
  type: string
  disabled?: boolean
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
    return isMobile ? 35 : 38
  }

  return (
    <>
      <Wrapper>
        <LogoWrapper>
          <ImageWithFallback
            src={logo}
            width={getImageSize()}
            height={getImageSize()}
            alt={`${currency?.symbol} Logo`}
            round
          />
        </LogoWrapper>
        <RightWrapper>
          <InfoWrapper>
            <CurrencySymbol>{currency?.symbol}</CurrencySymbol>
            {currency?.symbol != 'DEUS' ? (
              <Balance onClick={handleClick}>
                balance:
                {balanceDisplay ? balanceDisplay : '0.00'}
                {!disabled && <span>MAX</span>}
              </Balance>
            ) : null}
          </InfoWrapper>
          <InputWrapper>
            <NumericalInput
              value={value || ''}
              onUserInput={onChange}
              placeholder="0.0"
              autoFocus
              disabled={disabled}
              style={{ textAlign: 'right', height: '50px', fontSize: '1.3rem' }}
            />
          </InputWrapper>
        </RightWrapper>
      </Wrapper>
    </>
  )
}
