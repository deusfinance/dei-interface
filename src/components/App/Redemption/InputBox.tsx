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
import { RowBetween } from '../../Row/index'
import { ChevronDown as ChevronDownIcon } from 'components/Icons'

const Wrapper = styled.div`
  background: rgb(28 28 28);
  border-radius: 15px;
  color: ${({ theme }) => theme.text2};
  white-space: nowrap;
  height: 80px;
  gap: 10px;
  padding: 0.6rem;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 0.5rem;
  `}
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

// export const LogoWrapper = styled(RowBetween)<{ active?: boolean }>`
//   /* height: 100%; */
//   /* padding-left: 10px; */
//   /* width: 80px; */
//   cursor: ${({ active }) => active && 'pointer'};
// `

export const ChevronDown = styled(ChevronDownIcon)`
  margin-left: 7px;
  width: 16px;
  color: ${({ theme }) => theme.text1};

  ${({ theme }) => theme.mediaWidth.upToSmall`
      margin-left: 4px;
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
  title,
  disabled,
  maxValue,
  disable_vdeus,
  onTokenSelect,
}: {
  currency: Currency
  value: string
  onChange(values: string): void
  title?: string
  disabled?: boolean
  maxValue?: string | null
  disable_vdeus?: boolean
  onTokenSelect?: () => void
}) {
  const { account } = useWeb3React()
  // @ts-ignore
  const logo = useCurrencyLogo(currency?.wrapped?.address || currency?.address)
  const currencyBalance = useCurrencyBalance(account ?? undefined, currency ?? undefined)

  const [balanceExact, balanceDisplay] = useMemo(() => {
    if (!maxValue) return [maxAmountSpend(currencyBalance)?.toExact(), currencyBalance?.toSignificant(6)]
    return [maxValue, maxValue]
  }, [currencyBalance, maxValue])

  const handleClick = useCallback(() => {
    if (!balanceExact || !onChange) return
    onChange(balanceExact)
  }, [balanceExact, onChange])

  function getImageSize() {
    return isMobile ? 22 : 30
  }

  return (
    <Wrapper>
      <RowBetween alignItems={'center'}>
        <div style={{ fontSize: '0.75rem' }}>{title}</div>
        {currency?.symbol != 'DEUS' || disable_vdeus ? (
          <Balance onClick={handleClick}>
            {balanceDisplay ? balanceDisplay : '0.00'}
            {!disabled && <span>MAX</span>}
          </Balance>
        ) : null}
      </RowBetween>
      <RowBetween>
        <NumericalInput
          value={value || ''}
          onUserInput={onChange}
          placeholder="0.0"
          autoFocus
          disabled={disabled}
          style={{ textAlign: 'left', height: '50px', fontSize: '1.3rem' }}
        />
        <Row onClick={onTokenSelect ? () => onTokenSelect() : undefined}>
          <ImageWithFallback
            src={logo}
            width={getImageSize()}
            height={getImageSize()}
            alt={`${currency?.symbol} Logo`}
            round
          />
          <p style={{ marginLeft: '1px', fontSize: '1.5rem', color: '#ccc' }}>
            {!disable_vdeus && currency?.symbol == 'DEUS' && 'v'}
            {currency?.symbol}
          </p>
          {onTokenSelect && <ChevronDown />}
        </Row>
      </RowBetween>
    </Wrapper>
  )
}
