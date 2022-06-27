import { formatUnits } from '@ethersproject/units'
import { useMemo } from 'react'
import { useSingleContractMultipleData, useSingleContractMultipleMethods } from 'state/multicall/hooks'
import { toBN } from 'utils/numbers'
import { useVDeusContract, useVDeusStakingContract } from './useContract'
import useWeb3React from './useWeb3'
import { vDeusStakingPools } from 'constants/stakings'
import { useVDeusMasterChefV2Contract } from 'hooks/useContract'

export const VDEUS_USDC_FACTOR = 6

export function useVDeusStats(): {
  numberOfVouchers: number
  listOfVouchers: Array<number>
} {
  const { account } = useWeb3React()

  const vDeusContract = useVDeusContract()

  const calls = !account
    ? []
    : [
        {
          methodName: 'balanceOf',
          callInputs: [account],
        },
      ]

  const [vDeusBalance] = useSingleContractMultipleMethods(vDeusContract, calls)

  const { numberOfVouchers } = useMemo(() => {
    return {
      numberOfVouchers: vDeusBalance?.result ? toBN(formatUnits(vDeusBalance.result[0], 0)).toNumber() : 0,
    }
  }, [vDeusBalance])

  const idMapping = Array.from(Array(numberOfVouchers).keys())

  const callInputs = useMemo(() => {
    return !account ? [] : idMapping.map((id) => [account, id])
  }, [account, idMapping])

  const results = useSingleContractMultipleData(vDeusContract, 'tokenOfOwnerByIndex', callInputs)

  const listOfVouchers = useMemo(() => {
    return results
      .reduce((acc: number[], value) => {
        if (!value.result) return acc
        const result = value.result[0].toString()
        if (!result) return acc
        acc.push(parseInt(result))
        return acc
      }, [])
      .sort((a: number, b: number) => (a > b ? 1 : -1))
  }, [results])

  return {
    numberOfVouchers,
    listOfVouchers,
  }
}

export function useUserDeposits(
  tokenId: number,
  pid: number
): {
  nftId: number
  amount: number
  depositTimestamp: number
} | null {
  const { account } = useWeb3React()
  const stakingContract = useVDeusStakingContract()
  const calls = !account
    ? []
    : [
        {
          methodName: 'userDeposits',
          callInputs: [tokenId, account, pid],
        },
      ]

  const [result] = useSingleContractMultipleMethods(stakingContract, calls)
  return useMemo(() => {
    if (!result || !result.result || !result.result.length) return null

    return {
      nftId: toBN(result.result[0].toString()).toNumber(),
      amount: toBN(result.result[1].toString()).toNumber(),
      depositTimestamp: toBN(result.result[2].toString()).toNumber(),
    }
  }, [result])
}

export function useUserLockedNfts(): number[][] | null {
  const { account } = useWeb3React()
  const stakingContract = useVDeusStakingContract()
  const calls = !account
    ? []
    : vDeusStakingPools.map((pool) => ({ methodName: 'userNfts', callInputs: [pool.pid, account] }))

  const result = useSingleContractMultipleMethods(stakingContract, calls)
  console.log({ result })

  return useMemo(() => {
    if (!result || !result.length) return null
    return result.map((res) => res?.result?.nfts ?? [])
  }, [result])
}

export function useUserPendingTokens(): number[] {
  const contract = useVDeusMasterChefV2Contract()
  const { account } = useWeb3React()
  const calls = !account
    ? []
    : vDeusStakingPools.map((pool) => ({ methodName: 'pendingTokens', callInputs: [pool.pid, account] }))
  const pendingTokens = useSingleContractMultipleMethods(contract, calls)

  console.log({ pendingTokens, calls })

  return useMemo(
    () => pendingTokens.map((pt) => (pt?.result ? toBN(formatUnits(pt.result[0], 18)).toNumber() : 0)),
    [pendingTokens]
  )
}
