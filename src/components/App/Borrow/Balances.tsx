import React, { useMemo } from 'react'
import styled from 'styled-components'

import { useNativeCurrencyBalances, useTokenBalances } from 'state/wallet/hooks'
import useWeb3React from 'hooks/useWeb3'
import useCurrencyLogo from 'hooks/useCurrencyLogo'

import ImageWithFallback from 'components/ImageWithFallback'
import { Card } from 'components/Card'
import { CardTitle } from 'components/Title'
import { BorrowPool } from 'state/borrow/reducer'

const Wrapper = styled(Card)`
  display: flex;
  flex-flow: column nowrap;
  gap: 5px;
`

const Row = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
  gap: 10px;
`

interface TokenBalanceMap {
  [address: string]: {
    balance: string
    symbol: string
  }
}

export default function Balances({ pool }: { pool: BorrowPool }) {
  const { account } = useWeb3React()
  const tokens = useMemo(() => [pool.collateral, pool.pair], [pool])
  const balances = useTokenBalances(account ?? undefined, tokens)
  const nativeBalances = useNativeCurrencyBalances([account ?? undefined])

  const nativeBalance = useMemo(() => {
    if (!account || !nativeBalances[account]) return '0.00'
    // @ts-ignore
    return nativeBalances[account].toSignificant()
  }, [nativeBalances, account])

  const filteredBalances = useMemo(() => {
    return tokens.reduce((acc: TokenBalanceMap, token) => {
      const balance = balances[token.address]
      if (!balance || balance.toSignificant() === '0') return acc
      acc[token.address] = {
        balance: balance.toSignificant(),
        symbol: token.symbol ?? '',
      }
      return acc
    }, {})
  }, [balances, tokens])

  return (
    <Wrapper>
      <CardTitle>Balances</CardTitle>
      <BalanceRow address={'FTM'} symbol="FTM" balance={nativeBalance} />
      {Object.entries(filteredBalances).map(([address, obj], index) => (
        <BalanceRow key={index} address={address} symbol={obj.symbol} balance={obj.balance} />
      ))}
    </Wrapper>
  )
}

function BalanceRow({ address, symbol, balance }: { address: string; symbol: string; balance: string }) {
  const logo = useCurrencyLogo(address)
  return balance === '0' ? null : (
    <Row>
      <ImageWithFallback src={logo} alt={`${symbol} logo`} width={20} height={20} />
      {symbol} {balance}
    </Row>
  )
}
