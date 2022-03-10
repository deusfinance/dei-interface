import React, { useCallback } from 'react'
import styled from 'styled-components'
import { Currency } from '@sushiswap/core-sdk'

import useCurrencyLogo from 'hooks/useCurrencyLogo'
import useWeb3React from 'hooks/useWeb3'
import { useCurrencyBalance } from 'state/wallet/hooks'
import { maxAmountSpend } from 'utils/currency'

import ImageWithFallback from 'components/ImageWithFallback'
import Box from 'components/Box'
import { NumericalInput } from 'components/Input'

const Wrapper = styled(Box)`
  justify-content: space-between;
  align-items: flex-start;
  height: 70px;
  gap: 10px;
  padding: 0.6rem;
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
`

const Balance = styled(Row)`
  font-size: 0.7rem;
  text-align: center;
  margin-top: 5px;
  margin-left: 8px;
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
  value,
  onChange,
}: {
  currency: Currency | undefined
  value: string
  onChange(x?: string): void
}) {
  const { account } = useWeb3React()
  const balance = useCurrencyBalance(account ?? undefined, currency ?? undefined)
  const logo = useCurrencyLogo(currency?.wrapped.address)

  const handleClick = useCallback(() => {
    if (!balance || !onChange) return
    onChange(maxAmountSpend(balance)?.toExact())
  }, [balance, onChange])

  if (!currency) {
    return null
  }

  return (
    <>
      <Wrapper>
        <Column>
          <Row style={{ marginLeft: '5px' }}>
            <ImageWithFallback src={logo} width={30} height={30} alt={`${currency?.symbol} Logo`} round />
            {currency?.symbol}
          </Row>
          {currency && (
            <Balance onClick={handleClick}>
              {balance ? balance.toSignificant(6) : '0.00'} {currency?.symbol}
              <span>MAX</span>
            </Balance>
          )}
        </Column>
        <NumericalInput
          value={value || ''}
          onUserInput={onChange}
          placeholder={'Enter an amount'}
          autoFocus
          style={{ textAlign: 'right' }}
        />
      </Wrapper>
    </>
  )
}
