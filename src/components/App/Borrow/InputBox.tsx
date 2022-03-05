import React, { useCallback } from 'react'
import styled from 'styled-components'
import { Currency } from '@sushiswap/core-sdk'

import useCurrencyLogo from 'hooks/useCurrencyLogo'
import useWeb3React from 'hooks/useWeb3'
import { useCurrencyBalance } from 'state/wallet/hooks'
import { maxAmountSpend } from 'utils/currency'

import ImageWithFallback from 'components/ImageWithFallback'
import Box from './Box'

const Wrapper = styled(Box)`
  justify-content: flex-start;
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

const InputWrapper = styled.div`
  display: flex;
  flex: 1;
  justify-content: flex-end;
`

const InputField = styled.input`
  text-align: right;
  padding: 0px 1.25rem;
  height: 50px;
  border: none;
  background: transparent;
  font-size: 1rem;
  color: ${({ theme }) => theme.text2};

  &:focus,
  &:hover {
    outline: none;
  }
`

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
}

const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d*$`) // match escaped "." characters via in a non-capturing group
const NumericalInput = ({
  value,
  onUserInput,
  placeholder,
  ...rest
}: {
  value: string | number
  onUserInput: (input: string) => void
  placeholder: string
} & Omit<React.HTMLProps<HTMLInputElement>, 'ref' | 'onChange' | 'as'>) => {
  const enforcer = (nextUserInput: string) => {
    if (nextUserInput === '' || inputRegex.test(escapeRegExp(nextUserInput))) {
      onUserInput(nextUserInput)
    }
  }

  return (
    <InputWrapper>
      <InputField
        {...rest}
        value={value}
        onChange={(event) => {
          // replace commas with periods
          enforcer(event.target.value.replace(/,/g, '.'))
        }}
        // universal input options
        inputMode="decimal"
        title="Amount"
        autoComplete="off"
        autoCorrect="off"
        // text-specific options
        type="text"
        pattern="^[0-9]*[.,]?[0-9]*$"
        placeholder={placeholder || '0.00'}
        min={0}
        minLength={1}
        maxLength={79}
        spellCheck="false"
      />
    </InputWrapper>
  )
}

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
        <NumericalInput value={value || ''} onUserInput={onChange} placeholder={'Enter an amount'} autoFocus />
      </Wrapper>
    </>
  )
}
