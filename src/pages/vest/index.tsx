import React, { useState } from 'react'
import Link from 'next/link'
import styled from 'styled-components'

import useOwnedNfts from 'hooks/useOwnedNfts'

import Hero, { HeroSubtext } from 'components/Hero'
import Disclaimer from 'components/Disclaimer'
import { Table } from 'components/App/Vest'
import { PrimaryButton } from 'components/Button'
import LockManager from 'components/App/Vest/LockManager'

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

const CreateButton = styled(PrimaryButton)`
  margin-bottom: 15px;
  max-width: 200px;
  padding: 0px;
  a {
    width: 100%;
    height: 100%;
    padding: 1rem;
  }
`

export default function Vest() {
  const [showLockManager, setShowLockManager] = useState(false)
  const [lockId, setLockId] = useState(0)
  const nftIds = useOwnedNfts()

  return (
    <Container>
      <Hero>
        <div>veDEUS</div>
        <HeroSubtext>Happy dilution protection!</HeroSubtext>
      </Hero>
      <Wrapper>
        <CreateButton>
          <Link href="/vest/create" passHref>
            Create Lock
          </Link>
        </CreateButton>
        <Table
          nftIds={nftIds}
          toggleLockManager={(nftId: number) => {
            setShowLockManager(true)
            setLockId(nftId)
          }}
        />
      </Wrapper>
      <LockManager isOpen={showLockManager} onDismiss={() => setShowLockManager(false)} nftId={lockId} />
      <Disclaimer />
    </Container>
  )
}
