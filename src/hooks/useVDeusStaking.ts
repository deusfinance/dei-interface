import { useMemo } from 'react'
import { formatUnits } from '@ethersproject/units'

import useWeb3React from 'hooks/useWeb3'
import { useERC20Contract, useVDeusMasterChefV2Contract } from 'hooks/useContract'
import { useSingleContractMultipleMethods } from 'state/multicall/hooks'
import { toBN } from 'utils/numbers'
import { useDeusPrice } from './useCoingeckoPrice'
import { vDeusStakingPools } from 'constants/stakings'

export function useGlobalMasterChefData(flag = false): {
  tokenPerSecond: number
  totalAllocPoint: number
  poolLength: number
} {
  const contract = useVDeusMasterChefV2Contract(flag)

  const calls = [
    {
      methodName: 'tokenPerSecond',
      callInputs: [],
    },
    {
      methodName: 'totalAllocPoint',
      callInputs: [],
    },
    {
      methodName: 'poolLength',
      callInputs: [],
    },
  ]

  const [tokenPerSecond, totalAllocPoint, poolLength] = useSingleContractMultipleMethods(contract, calls)

  const { tokenPerSecondValue, totalAllocPointValue, poolLengthValue } = useMemo(() => {
    return {
      tokenPerSecondValue: tokenPerSecond?.result ? toBN(formatUnits(tokenPerSecond.result[0], 18)).toNumber() : 0,
      totalAllocPointValue: totalAllocPoint?.result ? toBN(totalAllocPoint.result[0].toString()).toNumber() : 0,
      poolLengthValue: poolLength?.result ? toBN(poolLength.result[0].toString()).toNumber() : 0,
    }
  }, [tokenPerSecond, totalAllocPoint, poolLength])

  return {
    tokenPerSecond: tokenPerSecondValue,
    totalAllocPoint: totalAllocPointValue,
    poolLength: poolLengthValue,
  }
}

//TODO: totalDeposited should consider decimals of token
export function usePoolInfo(
  pid: number,
  flag = false
): {
  accTokensPerShare: number
  lastRewardBlock: number
  allocPoint: number
  totalDeposited: number
} {
  const contract = useVDeusMasterChefV2Contract(flag)
  const tokenAddress = flag ? '0x72D049879BE3257F0Ca7bB02B7F8B557b4ecF638' : vDeusStakingPools[pid].lpToken
  const ERC20Contract = useERC20Contract(tokenAddress)

  const calls = [
    {
      methodName: 'poolInfo',
      callInputs: [pid.toString()],
    },
  ]

  const balanceCall = [
    {
      methodName: 'balanceOf',
      callInputs: [contract?.address],
    },
  ]

  const [poolInfo] = useSingleContractMultipleMethods(contract, calls)
  const [tokenBalance] = useSingleContractMultipleMethods(ERC20Contract, balanceCall)

  const { accTokensPerShare, lastRewardBlock, allocPoint, totalDeposited } = useMemo(() => {
    return {
      accTokensPerShare: poolInfo?.result ? toBN(poolInfo.result[0].toString()).toNumber() : 0,
      lastRewardBlock: poolInfo?.result ? toBN(poolInfo.result[1].toString()).toNumber() : 0,
      allocPoint: poolInfo?.result ? toBN(poolInfo.result[2].toString()).toNumber() : 0,
      totalDeposited: tokenBalance?.result ? toBN(formatUnits(tokenBalance.result[0], 18)).toNumber() : 0,
    }
  }, [poolInfo, tokenBalance])

  return {
    accTokensPerShare,
    lastRewardBlock,
    allocPoint,
    totalDeposited,
  }
}

//TODO: depositAmount should consider decimals of token
export function useUserInfo(
  pid: number,
  flag = false
): {
  depositAmount: number
  rewardsAmount: number
} {
  const contract = useVDeusMasterChefV2Contract(flag)
  const { account } = useWeb3React()

  const calls = !account
    ? []
    : [
        {
          methodName: 'userInfo',
          callInputs: [pid, account],
        },
        {
          methodName: 'pendingTokens',
          callInputs: [pid, account],
        },
      ]

  const [userInfo, pendingTokens] = useSingleContractMultipleMethods(contract, calls)

  const { depositedValue, rewardValue } = useMemo(() => {
    return {
      depositedValue: userInfo?.result ? toBN(formatUnits(userInfo.result[0], 18)).toNumber() : 0,
      rewardValue: pendingTokens?.result ? toBN(formatUnits(pendingTokens.result[0], 18)).toNumber() : 0,
    }
  }, [userInfo, pendingTokens])

  return {
    depositAmount: depositedValue,
    rewardsAmount: rewardValue,
  }
}

export function useGetApr(pid: number, flag = false): number {
  const { tokenPerSecond, totalAllocPoint } = useGlobalMasterChefData(flag)
  const { totalDeposited, allocPoint } = usePoolInfo(pid, flag)

  const deusPrice = useDeusPrice()
  if (totalDeposited === 0 || totalAllocPoint === 0) return 0
  return (
    (tokenPerSecond * (allocPoint / totalAllocPoint) * parseFloat(deusPrice) * 365 * 24 * 60 * 60 * 100) /
    totalDeposited
  )
}
