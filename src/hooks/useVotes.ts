import { useMemo } from 'react'
import { BigNumber } from '@ethersproject/bignumber'

import { VoteType } from 'hooks/useVoteCallback'
import { SolidlyPair } from 'apollo/queries'
import { useBaseV1VoterContract } from './useContract'
import { useSingleContractMultipleMethods } from 'state/multicall/hooks'

export function useVotes(options: SolidlyPair[], tokenID: BigNumber | null): VoteType[] {
  const baseVoterContract = useBaseV1VoterContract()

  const votesCall = useMemo(() => {
    if (!tokenID) return []
    return options.map((option) => ({ methodName: 'votes', callInputs: [tokenID, option.id] }))
  }, [tokenID])

  const userVotes = useSingleContractMultipleMethods(baseVoterContract, votesCall)

  let totalVoteWeight = BigNumber.from(0)

  const votes = useMemo(() => {
    let filteredVotes = []
    let sum = BigNumber.from(0)

    for (let index = 0; index < userVotes.length; index++) {
      const { result } = userVotes[index]
      if (result === undefined || !result.length) continue

      const number = result[0]
      if (number.eq(0)) continue
      sum = sum.add(number.abs())
      filteredVotes.push({ address: options[index].id, amount: number })
    }
    totalVoteWeight = sum

    for (let index = 0; index < filteredVotes.length; index++) {
      const amount = Math.round((filteredVotes[index].amount.toNumber() / totalVoteWeight.toNumber()) * 100)
      filteredVotes[index].amount = amount
    }

    return filteredVotes
  }, [userVotes])

  return votes
}
