import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import styled from 'styled-components'

import useOwnedNfts from 'hooks/useOwnedNfts'
import { useDeusPrice } from 'hooks/useCoingeckoPrice'
import useWeb3React from 'hooks/useWeb3'
import { useVestedAPY } from 'hooks/useVested'

import { formatAmount } from 'utils/numbers'
import { getMaximumDate } from 'utils/vest'

import Hero, { HeroSubtext } from 'components/Hero'
import Disclaimer from 'components/Disclaimer'
import { Table } from 'components/App/Bonds'
import { PrimaryButton } from 'components/Button'
import LockManager from 'components/App/Bonds/LockManager'
import APYManager from 'components/App/Bonds/APYManager'
import { RowEnd, RowStart } from 'components/Row'
import Box from 'components/Box'

const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  overflow: visible;
  margin: 0 auto;
`

const Wrapper = styled(Container)`
  margin: 0 auto;
  margin-top: 50px;
  width: clamp(250px, 90%, 1200px);

  // & > * {
  //   &:nth-child(3) {
  //     margin-bottom: 25px;
  //     display: flex;
  //     flex-flow: row nowrap;
  //     width: 100%;
  //     gap: 15px;
  //     & > * {
  //       &:last-child {
  //         max-width: 300px;
  //       }
  //     }
  //   }
  // }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    margin-top: 20px;
  `}
`

const UpperRow = styled(RowEnd)`
  gap: 10px;
  margin-bottom: 10px;
  height: 50px;
  & > * {
    height: 100%;
    max-width: fit-content;
    &:first-child {
      max-width: 200px;
      margin-right: auto;
    }
  }
`

const CardWrapper = styled.div`
  display: grid;
  gap: 10px;
  justify-content: space-between;
  grid-template-columns: auto auto;
  overflow: hidden;
  margin-bottom: 10px;
  background: ${({ theme }) => theme.bg1};
  border: 1px solid ${({ theme }) => theme.border1};
  border-radius: 2px;
  padding: 1.5rem 2rem;

  ${({ theme }) => theme.mediaWidth.upToSmall`
  padding: 1rem;
  display: grid;
  row-gap: 20px;
  justify-content: center;
  grid-template-columns: auto;
`}
`

const APYBox = styled(Box)`
  border: 0.5px solid ${({ theme }) => theme.yellow3};
  color: ${({ theme }) => theme.yellow3};
`

const InfoRow = styled(RowStart)`
  display: flex;
  flex-flow: row nowrap;
  white-space: nowrap;
`

const BalanceText = styled.div`
  color: ${({ theme }) => theme.yellow3};
  margin-left: 5px;
`

export default function Vest() {
  const { chainId, account } = useWeb3React()
  const [showLockManager, setShowLockManager] = useState(false)
  const [showAPYManager, setShowAPYManager] = useState(false)
  const [nftId, setNftId] = useState(0)
  const nftIds = useOwnedNfts()
  const { lockedVeDEUS, globalAPY } = useVestedAPY(undefined, getMaximumDate())
  const deusPrice = useDeusPrice()
  const info = [
    { symbol: 'APY', balance: '53%' },
    { symbol: 'Current Redeem Lower Band', balance: '0.374' },
    { symbol: 'Circulating Supply', balance: formatAmount(33_040_012) },
    { symbol: 'Total DEI Supply', balance: formatAmount(60_000_000) },
  ]

  useEffect(() => {
    setShowLockManager(false)
    setShowAPYManager(false)
  }, [chainId, account])

  const toggleLockManager = (nftId: number) => {
    setShowLockManager(true)
    setShowAPYManager(false)
    setNftId(nftId)
  }

  const toggleAPYManager = (nftId: number) => {
    setShowLockManager(false)
    setShowAPYManager(true)
    setNftId(nftId)
  }

  return (
    <Container>
      <Hero>
        <div>Bonds</div>
        <HeroSubtext>..........</HeroSubtext>
      </Hero>
      <Wrapper>
        <UpperRow>
          <Link href="/bonds/create" passHref>
            <PrimaryButton>Buy Bond</PrimaryButton>
          </Link>
        </UpperRow>
        <CardWrapper>
          {info.map((i, index) => (
            <BalanceRow symbol={i.symbol} balance={i.balance} key={index} />
          ))}
        </CardWrapper>
        <Table nftIds={nftIds} toggleLockManager={toggleLockManager} toggleAPYManager={toggleAPYManager} />
      </Wrapper>
      <LockManager isOpen={showLockManager} onDismiss={() => setShowLockManager(false)} nftId={nftId} />
      <APYManager
        isOpen={showAPYManager}
        onDismiss={() => setShowAPYManager(false)}
        nftId={nftId}
        toggleLockManager={toggleLockManager}
      />

      <Disclaimer />
    </Container>
  )
}

function BalanceRow({ symbol, balance }: { symbol: string; balance: string }) {
  return (
    <InfoRow>
      {symbol}: <BalanceText>{balance}</BalanceText>
    </InfoRow>
  )
}
