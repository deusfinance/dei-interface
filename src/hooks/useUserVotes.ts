import { useMemo } from 'react'
import BigNumber from 'bignumber.js'

import { VoteType } from 'hooks/useVoteCallback'
import { useSearch } from 'components/App/Liquidity'
import { useBaseV1VoterContract } from 'hooks/useContract'
import { useSingleContractMultipleMethods } from 'state/multicall/hooks'

export function useUserVotes(tokenID: BigNumber | null): VoteType[] {
  const { solidlyPairs } = useSearch()
  const baseVoterContract = useBaseV1VoterContract()

  const votesCall = useMemo(() => {
    if (!tokenID) return []
    return solidlyPairs.map((solidlyPair) => ({
      methodName: 'votes',
      callInputs: [tokenID.toString(), solidlyPair.id],
    }))
  }, [tokenID, solidlyPairs])

  const allVotes = useSingleContractMultipleMethods(baseVoterContract, votesCall)

  let totalVoteWeight = new BigNumber(0)

  const votes = useMemo(() => {
    const filteredVotes = []
    let sum = new BigNumber(0)

    for (let index = 0; index < allVotes.length; index++) {
      const { result } = allVotes[index]
      if (result === undefined || !result.length) continue

      const number = result[0]
      if (number.eq(0)) continue
      sum = sum.plus(number.abs().toString())
      filteredVotes.push({ address: solidlyPairs[index].id, amount: number })
    }
    totalVoteWeight = sum

    for (let index = 0; index < filteredVotes.length; index++) {
      const amount = Math.round(
        (Number(filteredVotes[index].amount.toString()) / Number(totalVoteWeight.toString())) * 100
      )
      filteredVotes[index].amount = amount
    }

    return filteredVotes
  }, [allVotes])

  return votes
}
