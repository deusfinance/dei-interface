import React, { useState } from 'react'
import Link from 'next/link'
import styled from 'styled-components'

import useOwnedNfts from 'hooks/useOwnedNfts'
import { useDeusPrice } from 'hooks/useCoingeckoPrice'
import useWeb3React from 'hooks/useWeb3'
import { useVestedAPY } from 'hooks/useVested'

import { formatAmount, formatDollarAmount } from 'utils/numbers'
import { getMaximumDate } from 'utils/vest'

import Hero, { HeroSubtext } from 'components/Hero'
import Disclaimer from 'components/Disclaimer'
import { Table } from 'components/App/Bonds'
import { PrimaryButton } from 'components/Button'
import { RowEnd } from 'components/Row'
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

  & > * {
    &:nth-child(3) {
      margin-bottom: 25px;
      display: flex;
      flex-flow: row nowrap;
      width: 100%;
      gap: 15px;
      & > * {
        &:last-child {
          max-width: 300px;
        }
      }
    }
  }

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

    ${({ theme }) => theme.mediaWidth.upToMedium`
      &:nth-child(2) {
        display: none;
      }
    `}
    ${({ theme }) => theme.mediaWidth.upToSmall`
      &:nth-child(3) {
        display: none;
      }
      flex: 1;
      max-width: none;
    `}
  }
`

export default function Bonds() {
  const { chainId, account } = useWeb3React()
  const [nftId, setNftId] = useState(0)
  const nftIds = useOwnedNfts()
  const { lockedVeDEUS, globalAPY } = useVestedAPY(undefined, getMaximumDate())
  const deusPrice = useDeusPrice()

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
          <Box>DEUS Price: {formatDollarAmount(parseFloat(deusPrice), 2)}</Box>
          <Box>veDEUS Locked: {formatAmount(parseFloat(lockedVeDEUS), 0)}</Box>
          <Box>Max APY: {formatAmount(parseFloat(globalAPY), 0)}%</Box>
        </UpperRow>
        <Table bondIds={nftIds} />
      </Wrapper>
      <Disclaimer />
    </Container>
  )
}
