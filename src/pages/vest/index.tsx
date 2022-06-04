import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import styled from 'styled-components'

import useOwnedNfts from 'hooks/useOwnedNfts'
import useWeb3React from 'hooks/useWeb3'
import { useVestedAPY } from 'hooks/useVested'
import useDistRewards from 'hooks/useDistRewards'

import { formatAmount } from 'utils/numbers'
import { getMaximumDate } from 'utils/vest'

import Hero, { HeroSubtext } from 'components/Hero'
import Disclaimer from 'components/Disclaimer'
import { PrimaryButton } from 'components/Button'
import { RowEnd } from 'components/Row'
import Box from 'components/Box'
import { Table } from 'components/App/Vest'
import LockManager from 'components/App/Vest/LockManager'
import APYManager from 'components/App/Vest/APYManager'
import ClaimAll from 'components/App/Vest/ClaimAll'

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
      max-width: 185px;
      margin-right: auto;
    }
    &:last-child {
      max-width: 185px;
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

    `}
  }
`

export default function Vest() {
  const { chainId, account } = useWeb3React()
  const [showLockManager, setShowLockManager] = useState(false)
  const [showAPYManager, setShowAPYManager] = useState(false)
  const [nftId, setNftId] = useState(0)
  const { lockedVeDEUS, globalAPY } = useVestedAPY(undefined, getMaximumDate())
  const rewards = useDistRewards()
  const nftIds = useOwnedNfts()

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
        <div>veDEUS</div>
        <HeroSubtext>Happy dilution protection!</HeroSubtext>
      </Hero>
      <Wrapper>
        <UpperRow>
          <Link href="/vest/create" passHref>
            <PrimaryButton>Create Lock</PrimaryButton>
          </Link>
          <Box>veDEUS Locked: {formatAmount(parseFloat(lockedVeDEUS), 0)}</Box>
          <Box>Max APY: {formatAmount(parseFloat(globalAPY), 0)}%</Box>
          <ClaimAll nftIds={nftIds} rewards={rewards} />
        </UpperRow>
        <Table
          nftIds={nftIds}
          rewards={rewards}
          toggleLockManager={toggleLockManager}
          toggleAPYManager={toggleAPYManager}
        />
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
