import { useMemo } from 'react'
import { BigNumber } from '@ethersproject/bignumber'

import { useSingleContractMultipleMethods } from 'state/multicall/hooks'
import { useStablePoolContract } from 'hooks/useContract'

import { StablePoolType } from 'constants/sPools'
import { BN_TEN, toBN } from 'utils/numbers'

export function usePoolBalances(pool: StablePoolType): number[] {
  const contract = useStablePoolContract(pool)

  const tokenBalancesCall = useMemo(
    () =>
      pool.liquidityTokens.map((t, index) => ({
        methodName: 'getTokenBalance',
        callInputs: [index],
      })),
    [pool]
  )
  const results = useSingleContractMultipleMethods(contract, tokenBalancesCall)

  return useMemo(() => {
    if (!results || !results.length) return []

    return results.map((result, index: number) => {
      if (!result.result?.length) return 0
      return toBN(result.result[0].toString()).div(BN_TEN.pow(pool.liquidityTokens[index].decimals)).toNumber()
    })
  }, [results, pool])
}

export function useAddLiquidity(pool: StablePoolType, amountIns: string[]): number {
  const contract = useStablePoolContract(pool)

  const amountsInBN: string[] = useMemo(() => {
    return amountIns.map((amount, index) => {
      if (!amount) return '0'
      return toBN(amount).times(BN_TEN.pow(pool.liquidityTokens[index].decimals)).toFixed()
    })
  }, [amountIns, pool])

  const liqCalls = useMemo(
    () =>
      !amountsInBN.length
        ? []
        : [
            {
              methodName: 'calculateTokenAmount',
              callInputs: [amountsInBN, 'true'],
            },
          ],
    [amountsInBN]
  )

  const [result] = useSingleContractMultipleMethods(contract, liqCalls)

  return useMemo(() => {
    if (!result || !result.result?.length) return 0
    return toBN(result.result[0].toString()).div(1e18).toNumber()
  }, [result])
}

export function useRemoveLiquidity(pool: StablePoolType, amountIn: string): number[] {
  const contract = useStablePoolContract(pool)

  const amountInBN = toBN(amountIn).times(1e18).toFixed()
  const liqCalls = useMemo(
    () =>
      amountIn == ''
        ? []
        : [
            {
              methodName: 'calculateRemoveLiquidity',
              callInputs: [amountInBN],
            },
          ],
    [amountIn, amountInBN]
  )

  const [result] = useSingleContractMultipleMethods(contract, liqCalls)

  return useMemo(() => {
    if (!result || !result.result?.length) return []
    if (!result.result[0].length) return []
    return result.result[0].map((balance: BigNumber, index: number) => {
      return toBN(balance.toString()).div(BN_TEN.pow(pool.liquidityTokens[index].decimals)).toNumber().toString()
    })
  }, [result, pool])
}
