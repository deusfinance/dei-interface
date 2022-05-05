import React, { useState, useCallback, useEffect } from 'react'
import styled from 'styled-components'
import { BigNumber } from '@ethersproject/bignumber'

import { SolidlyPair } from 'apollo/queries'
import Hero, { HeroSubtext } from 'components/Hero'
import { useSearch, SearchField } from 'components/App/Liquidity'
import Disclaimer from 'components/Disclaimer'
import { Table, VotingPower } from 'components/App/Vote'
import { useVeNFTTokens } from 'hooks/useVeNFT'
import { RowEnd } from 'components/Row'
import useVoteCallback, { VoteType } from 'hooks/useVoteCallback'
import { useVotes } from 'hooks/useVotes'

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

const UpperRow = styled(RowEnd)`
  gap: 10px;
  margin-bottom: 10px;
  height: 50px;
  & > * {
    height: 100%;
    max-width: fit-content;
    &:first-child {
      max-width: 400px;
      margin-right: auto;
    }

    ${({ theme }) => theme.mediaWidth.upToMedium`
      &:nth-child(2) {
        display: none;
      }
    `}
  }
`

export default function Vote() {
  // TODO: add hooks for get client veNft
  // TODO: add shows client veNfts
  // TODO: add drop down for choose nft

  const { snapshot, searchProps } = useSearch()
  const { veNFTBalance, veNFTTokens, veNFTTokenIds } = useVeNFTTokens()
  const [selectedTokenID, setSelectedTokenId] = useState<BigNumber | null>(null)
  const userVotes = useVotes(snapshot.options as unknown as SolidlyPair[], selectedTokenID)

  // this pre voted pairs can't be less than the specified amount
  // const preVotedPairs = [{ address: '0x5821573d8f04947952e76d94f3abc6d7b43bf8d0', amount: 20 }]
  // const [preVotedPairs, setPreVotedPairs] = useState<VoteType[]>()

  const [votes, setVotes] = useState<VoteType[]>([])
  const [loading, setLoading] = useState(false)

  const { callback } = useVoteCallback([], selectedTokenID)

  const onCastVote = useCallback(async () => {
    if (!callback) return

    let error = ''
    try {
      const txHash = await callback()
      console.log(txHash)
    } catch (e) {
      if (e instanceof Error) {
        error = e.message
      } else {
        console.error(e)
        error = 'An unknown error occurred.'
      }
    }
    setLoading(false)
  }, [callback])

  useEffect(() => {
    setVotes(userVotes)
  }, [JSON.stringify(userVotes)])

  return (
    <Container>
      <Hero>
        <div>Solidly Vote</div>
        <HeroSubtext>Vote with your veNFT.</HeroSubtext>
      </Hero>
      <Wrapper>
        <UpperRow>
          <SearchField searchProps={searchProps} />
        </UpperRow>
        <Table
          options={snapshot.options as unknown as SolidlyPair[]}
          votes={votes}
          setVotes={setVotes}
          preVotedPairs={null}
        />
      </Wrapper>
      <VotingPower votes={votes} onCastVote={onCastVote} loading={loading} setLoading={setLoading} />
      <Disclaimer />
    </Container>
  )
}
