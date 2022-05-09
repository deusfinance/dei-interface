import React, { useState, useCallback, useEffect, useMemo } from 'react'
import styled from 'styled-components'
import BigNumber from 'bignumber.js'

import { SolidlyPair } from 'apollo/queries'
import Hero, { HeroSubtext } from 'components/Hero'
import { useSearch, SearchField } from 'components/App/Liquidity'
import Disclaimer from 'components/Disclaimer'
import { Table, VotingPower } from 'components/App/Vote'
import Dropdown from 'components/Dropdown'
import { RowBetween } from 'components/Row'
import useVoteCallback, { VoteType } from 'hooks/useVoteCallback'
import { useUserVotes } from 'hooks/useUserVotes'
import { useVeNFTTokens } from 'hooks/useVeNFT'

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

const UpperRow = styled(RowBetween)`
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
  const [selectedTokenID, setSelectedTokenID] = useState<BigNumber | null>(null)
  const [votes, setVotes] = useState<VoteType[]>([])
  const [loading, setLoading] = useState(false)

  const { snapshot, searchProps } = useSearch()
  const { veNFTTokenIds } = useVeNFTTokens()
  const { callback } = useVoteCallback(votes, selectedTokenID)

  const userVotes = useUserVotes(selectedTokenID)

  // this pre voted pairs can't be less than the specified amount
  // const preVotedPairs = [{ address: '0x5821573d8f04947952e76d94f3abc6d7b43bf8d0', amount: 20 }]
  // const [preVotedPairs, setPreVotedPairs] = useState<VoteType[]>()

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
  }, [JSON.stringify(userVotes), selectedTokenID])

  const dropdownOptions = useMemo(() => {
    if (!veNFTTokenIds.length) return []

    const tokenIDs = veNFTTokenIds.map((token, index) => {
      return { value: index.toString(), label: `NFT #${token.toString()}` }
    })

    return tokenIDs
  }, [JSON.stringify(veNFTTokenIds)])

  const dropdownOnSelect = (val: string) => {
    const index = parseInt(val, 10)
    setSelectedTokenID(new BigNumber(veNFTTokenIds[index].toString()))
  }

  return (
    <Container>
      <Hero>
        <div>Solidly Vote</div>
        <HeroSubtext>Vote with your veNFT.</HeroSubtext>
      </Hero>
      <Wrapper>
        <UpperRow>
          <SearchField searchProps={searchProps} />
          <Dropdown
            options={dropdownOptions}
            placeholder="Select Token ID"
            onSelect={(v) => dropdownOnSelect(v)}
            width="200px"
          />
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
