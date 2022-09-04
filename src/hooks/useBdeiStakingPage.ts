import { useMemo } from 'react'
import { useERC20Contract, useMasterChefContract } from 'hooks/useContract'
import { useSingleContractMultipleMethods } from 'state/multicall/hooks'
import { toBN } from 'utils/numbers'
import useWeb3React from './useWeb3'
import { BDEI_TOKEN } from 'constants/tokens'
import { formatUnits } from '@ethersproject/units'
import { useDeiPrice, useDeusPrice } from './useCoingeckoPrice'
import { StakingType } from 'constants/stakings'

export function useTokenPerBlock(stakingPool: StakingType): {
  tokenPerBlock: number
  totalDeposited: number
} {
  const contract = useMasterChefContract(stakingPool)
  const bDEIContract = useERC20Contract(BDEI_TOKEN.address)

  const calls = [
    {
      methodName: 'tokenPerBlock',
      callInputs: [],
    },
  ]

  const bDEICalls = !contract
    ? []
    : [
        {
          methodName: 'balanceOf',
          callInputs: [contract.address],
        },
      ]

  const [tokenPerBlock] = useSingleContractMultipleMethods(contract, calls)
  const [totalBDEI] = useSingleContractMultipleMethods(bDEIContract, bDEICalls)

  const { tokenPerBlockValue, totalbDEIValue } = useMemo(() => {
    return {
      tokenPerBlockValue: tokenPerBlock?.result ? toBN(formatUnits(tokenPerBlock.result[0], 18)).toNumber() : 0,
      totalbDEIValue: totalBDEI?.result ? toBN(formatUnits(totalBDEI.result[0], 18)).toNumber() : 0,
    }
  }, [tokenPerBlock, totalBDEI])

  return {
    tokenPerBlock: tokenPerBlockValue,
    totalDeposited: totalbDEIValue,
  }
}

export function useStakingData(pool: StakingType): {
  depositAmount: number
  rewardsAmount: number
  totalDeposited: number
  tokenPerBlock: number
} {
  const contract = useMasterChefContract(pool)
  const { account } = useWeb3React()
  const bDEIContract = useERC20Contract(BDEI_TOKEN.address)
  const calls = !account
    ? []
    : [
        {
          methodName: 'userInfo',
          callInputs: [pool.pid.toString(), account],
        },
        {
          methodName: 'tokenPerBlock',
          callInputs: [],
        },
        {
          methodName: 'pendingTokens',
          callInputs: [pool.pid.toString(), account],
        },
      ]

  const bDEICalls = !contract
    ? []
    : [
        {
          methodName: 'balanceOf',
          callInputs: [contract.address],
        },
      ]

  const [userInfo, tokenPerBlock, pendingTokens] = useSingleContractMultipleMethods(contract, calls)
  const [totalBDEI] = useSingleContractMultipleMethods(bDEIContract, bDEICalls)

  const { depositedValue, reward, tokenPerBlockValue, totalbDEIValue } = useMemo(() => {
    return {
      depositedValue: userInfo?.result ? toBN(formatUnits(userInfo.result[0], 18)).toNumber() : 0,
      reward: pendingTokens?.result ? toBN(formatUnits(pendingTokens.result[0], 18)).toNumber() : 0,
      tokenPerBlockValue: tokenPerBlock?.result ? toBN(formatUnits(tokenPerBlock.result[0], 18)).toNumber() : 0,
      totalbDEIValue: totalBDEI?.result ? toBN(formatUnits(totalBDEI.result[0], 18)).toNumber() : 0,
    }
  }, [userInfo, tokenPerBlock, pendingTokens, totalBDEI])

  return {
    depositAmount: depositedValue,
    rewardsAmount: reward,
    tokenPerBlock: tokenPerBlockValue,
    totalDeposited: totalbDEIValue,
  }
}

export function useGetApy(stakingPool: StakingType): number {
  const { tokenPerBlock, totalDeposited } = useTokenPerBlock(stakingPool)
  // const { tokenPerBlock, totalDeposited } = useStakingData(0)
  console.log(tokenPerBlock, totalDeposited)
  const deiPrice = useDeiPrice()
  const deusPrice = useDeusPrice()
  return (tokenPerBlock * parseFloat(deusPrice) * 365 * 24 * 60 * 60 * 100) / (totalDeposited * parseFloat(deiPrice))
}
