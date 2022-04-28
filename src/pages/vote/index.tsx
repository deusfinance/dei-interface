import React, { useState } from 'react'
import styled from 'styled-components'

import { SolidlyPair } from 'apollo/queries'

import Hero, { HeroSubtext } from 'components/Hero'
import Disclaimer from 'components/Disclaimer'
import { Table, VotingPower } from 'components/App/Vote'
import { useSearch } from 'components/App/Liquidity'

const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  overflow: visible;
  margin: 0 auto;
`

const Wrapper = styled(Container)`
  margin: 0 auto;
  margin-top: 50px;
  width: clamp(250px, 90%, 1400px);

  ${({ theme }) => theme.mediaWidth.upToMedium`
    margin-top: 20px;
  `}
`

export default function Vote() {
  const { snapshot } = useSearch()
  // TODO: add hooks for get client veNft and votes
  // TODO: add search bar and shows client veNft

  const preVotedPairs = [
    { address: '0x8a20082c9ba0928248a4912e7d8e18da96f3a612', amount: 20 },
    { address: '0x01da9b46ca6a5f7696c8684c4dd71e2da1ea4b87', amount: 40 },
    { address: '0xd1163e3b2182779af46090da404beed19f1d83e2', amount: 20 },
  ]

  // TODO: remove preVotedPairs in the useState
  const [votes, setVotes] = useState<{ address: string; amount: number }[]>(preVotedPairs)

  return (
    <Container>
      <Hero>
        <div>Solidly Vote</div>
        <HeroSubtext>Vote with your veNFT.</HeroSubtext>
      </Hero>
      <Wrapper>
        <Table
          options={snapshot.options as unknown as SolidlyPair[]}
          votes={votes}
          setVotes={setVotes}
          preVotedPairs={preVotedPairs}
        />
      </Wrapper>
      <VotingPower votes={votes} />
      <Disclaimer />
    </Container>
  )
}
