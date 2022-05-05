import React, { useEffect, useState, useMemo } from 'react'
import styled from 'styled-components'

import { VoteType } from 'hooks/useVoteCallback'
import { DotFlashing } from 'components/Icons'

const enum VoteState {
  VALID = 'valid',
  NOT_VALID = 'not_valid',
}

const Container = styled.div`
  padding: 10px 0;
  width: 560px;
  background: rgba(20, 20, 20, 0.9);
  position: fixed;
  bottom: 30px;
  left: 50%;
  -webkit-transform: translatex(-50%);
  transform: translatex(-50%);
  border-radius: 12px;
  border: 1px solid rgba(126, 153, 176, 0.2);
  z-index: 50;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    width: 80%;
  `}
`

const Wrapper = styled.div`
  width: calc(100% + 16px);
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  box-sizing: border-box;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    margin: 0px 40px 0px 0px;
  `}
`

const ItemsWrapper = styled.div`
  padding: 12px 24px;
  display: flex;
  justify-content: center;
  flex-direction: row;
  margin: 0px 10px;
  height: 100%;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    padding: 0px;
    margin-bottom: 10px;
  `}
`

const CastVote = styled.button<{ voteState: VoteState }>`
  width: 200px;
  height: 40px;
  border-radius: 12px;
  text-align: center;
  border: 1px solid rgba(126, 153, 176, 0.2);
  background-color: #789495;
  display: flex;
  justify-content: center;
  & > * {
    &:first-child {
      margin: 10px 5px 0px 0px;
    }
  }

  // Change color when the voting power exceeds 100
  border-color: ${({ theme, voteState }) => (voteState == VoteState.VALID ? theme.primary3 : 'red')};

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    width: 80%;
    margin: 10px 20px;
  `}
`

const CastVoteText = styled.span<{ voteState: VoteState }>`
  // Change color when the voting power exceeds 100
  color: ${({ theme, voteState }) => (voteState == VoteState.VALID ? theme.primary3 : 'red')};
`

const VotingPowerPercent = styled.div<{ voteState: VoteState }>`
  // Change color when the voting power exceeds 100
  color: ${({ theme, voteState }) => (voteState == VoteState.VALID ? theme.primary3 : 'red')};
  margin-left: 5px;
  width: 40px;
`

export default function VotingPower({
  votes,
  onCastVote,
  loading,
  setLoading,
}: {
  votes: VoteType[]
  onCastVote: () => void
  loading: boolean
  setLoading: (loading: boolean) => void
}) {
  // TODO: add loading for cast vote button
  const [votingPower, setVotingPower] = useState(10)
  const voteState = useMemo(() => (votingPower > 100 ? VoteState.NOT_VALID : VoteState.VALID), [votingPower])

  useEffect(() => {
    let power = 0
    votes.forEach((vote) => {
      power += Math.abs(vote.amount)
    })
    setVotingPower(power)
  }, [votes])

  const castVoteHandler = () => {
    if (votingPower > 100) return
    setLoading(true)
    onCastVote()
  }

  return (
    <Container>
      <Wrapper>
        <ItemsWrapper>
          <p>Voting Power Used:</p>
          <VotingPowerPercent voteState={voteState}>{votingPower}%</VotingPowerPercent>
        </ItemsWrapper>
        <CastVote voteState={voteState} onClick={castVoteHandler}>
          <CastVoteText voteState={voteState}>Cast Votes</CastVoteText>
          {loading && <DotFlashing />}
        </CastVote>
      </Wrapper>
    </Container>
  )
}
