import { useMemo } from 'react'
import { useERC20Contract, useMasterChefV2Contract } from 'hooks/useContract'
import { useSingleContractMultipleMethods } from 'state/multicall/hooks'
import { toBN } from 'utils/numbers'
import useWeb3React from './useWeb3'
import { BDEI_TOKEN } from 'constants/tokens'
import { formatUnits } from '@ethersproject/units'
import { useDeiPrice, useDeusPrice } from './useCoingeckoPrice'

export function useStakingData(pid: number): {
  depositAmount: number
  rewardsAmount: number
  totalDeposited: number
  tokenPerBlock: number
} {
  const contract = useMasterChefV2Contract()
  const { account } = useWeb3React()
  const bDEIContract = useERC20Contract(BDEI_TOKEN.address)
  const calls = !account
    ? []
    : [
        {
          methodName: 'userInfo',
          callInputs: [pid.toString(), account],
        },
        {
          methodName: 'tokenPerBlock',
          callInputs: [],
        },
        {
          methodName: 'pendingTokens',
          callInputs: [pid.toString(), account],
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
      tokenPerBlockValue: tokenPerBlock?.result ? toBN(tokenPerBlock.result[0].toString()).toNumber() : 0,
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

export function useGetApy(): number {
  const { tokenPerBlock, totalDeposited } = useStakingData(0)
  const deiPrice = useDeiPrice()
  const deusPrice = useDeusPrice()
  return (
    (tokenPerBlock * (tokenPerBlock * parseFloat(deusPrice) * 365 * 24 * 60 * 60)) /
    (totalDeposited * parseFloat(deiPrice))
  )
}
