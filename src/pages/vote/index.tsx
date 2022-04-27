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
  // TODO: add hooks for get user veNft and votes
  const [votes, setVotes] = useState<{ address: string; percent: number }[]>([])

  return (
    <Container>
      <Hero>
        <div>Solidly Vote</div>
        <HeroSubtext>Vote with your veNFT.</HeroSubtext>
      </Hero>
      <Wrapper>
        <Table options={snapshot.options as unknown as SolidlyPair[]} votes={votes} setVotes={setVotes} />
      </Wrapper>
      <VotingPower votes={votes} />
      <Disclaimer />
    </Container>
  )
}
