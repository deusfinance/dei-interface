import { formatUnits } from '@ethersproject/units'
import { Percent } from '@sushiswap/core-sdk'
import BigNumber from 'bignumber.js'
import { useMemo } from 'react'

import { BorrowPool } from 'state/borrow/reducer'
import { useMultipleContractSingleData, useSingleContractMultipleMethods } from 'state/multicall/hooks'
import { useGeneralLenderContract, useLenderManagerContract, useOracleContract } from './useContract'
import GENERAL_LENDER_ABI from 'constants/abi/GENERAL_LENDER.json'

import { DEI_TOKEN } from 'constants/borrow'
import { constructPercentage } from 'utils/prices'
import useWeb3React from './useWeb3'
import { Interface } from '@ethersproject/abi'

export function useUserPoolData(pool: BorrowPool): {
  userCollateral: string
  userBorrow: string
  userCap: string
  userDebt: string
} {
  const { account } = useWeb3React()
  const generalLenderContract = useGeneralLenderContract(pool)
  const lenderManagerContract = useLenderManagerContract()

  const collateralBorrowCalls = useMemo(
    () =>
      !account
        ? []
        : [
            {
              methodName: 'userCollateral',
              callInputs: [account],
            },
            {
              methodName: 'userBorrow',
              callInputs: [account],
            },
          ],
    [account]
  )

  const userCapCalls = useMemo(
    () =>
      !account
        ? []
        : [
            {
              methodName: 'getCap',
              callInputs: [account],
            },
          ],
    [account]
  )

  const [userCollateral, userBorrow] = useSingleContractMultipleMethods(generalLenderContract, collateralBorrowCalls)
  const [userCap] = useSingleContractMultipleMethods(lenderManagerContract, userCapCalls)

  const { userCollateralValue, userBorrowValue, userCapValue } = useMemo(
    () => ({
      userCollateralValue:
        collateralBorrowCalls.length && userCollateral?.result
          ? formatUnits(userCollateral.result[0], pool.contract.decimals)
          : '0',
      userBorrowValue:
        collateralBorrowCalls.length && userBorrow?.result
          ? formatUnits(userBorrow.result[0], DEI_TOKEN.decimals)
          : '0',
      userCapValue: userCapCalls.length && userCap?.result ? formatUnits(userCap.result[0], DEI_TOKEN.decimals) : '0',
    }),
    [collateralBorrowCalls, userCapCalls, userCollateral, userBorrow, userCap, pool]
  )

  // It's impossible to call debt if the user has no deposits, hence the userBorrowValue check
  const debtCalls = useMemo(
    () =>
      !account || !parseFloat(userBorrowValue)
        ? []
        : [
            {
              methodName: 'getDebt',
              callInputs: [account],
            },
          ],
    [account, userBorrowValue]
  )
  const [userDebt] = useSingleContractMultipleMethods(generalLenderContract, debtCalls)
  const userDebtValue = useMemo(
    () => (debtCalls.length && userDebt?.result ? formatUnits(userDebt.result[0], DEI_TOKEN.decimals) : '0'),
    [debtCalls, userDebt]
  )

  return useMemo(
    () => ({
      userCollateral: userCollateralValue,
      userBorrow: userBorrowValue,
      userCap: userCapValue,
      userDebt: userDebtValue,
    }),
    [userCollateralValue, userBorrowValue, userCapValue, userDebtValue]
  )
}

export function useGlobalPoolData(pool: BorrowPool): {
  totalCollateral: string
  borrowedElastic: string
  borrowedBase: string
  liquidationRatio: Percent
  borrowFee: Percent
  interestPerSecond: number
} {
  const generalLenderContract = useGeneralLenderContract(pool)

  const calls = [
    {
      methodName: 'totalCollateral',
      callInputs: [],
    },
    {
      methodName: 'totalBorrow',
      callInputs: [],
    },
    {
      methodName: 'LIQUIDATION_RATIO',
      callInputs: [],
    },
    {
      methodName: 'BORROW_OPENING_FEE',
      callInputs: [],
    },
    {
      methodName: 'accrueInfo',
      callInputs: [],
    },
  ]

  const [totalCollateral, totalBorrow, liquidationRatio, borrowFee, accrueInfo] = useSingleContractMultipleMethods(
    generalLenderContract,
    calls
  )

  return useMemo(
    () => ({
      totalCollateral: totalCollateral?.result ? formatUnits(totalCollateral.result[0], pool.contract.decimals) : '0',
      borrowedElastic: totalBorrow?.result ? formatUnits(totalBorrow.result[0], pool.contract.decimals) : '0',
      borrowedBase: totalBorrow?.result ? formatUnits(totalBorrow.result[1], pool.contract.decimals) : '0',
      liquidationRatio: liquidationRatio?.result
        ? constructPercentage(Number(formatUnits(liquidationRatio.result[0], 2))) // LIQUIDATION_RATIO_PRECISION
        : constructPercentage(100),
      borrowFee: borrowFee?.result
        ? constructPercentage(Number(formatUnits(borrowFee.result[0], 2))) // BORROW_OPENING_FEE_PRECISION
        : constructPercentage(100),
      interestPerSecond: accrueInfo?.result ? Number(formatUnits(accrueInfo.result[2], 18)) : 0,
    }),
    [pool, totalCollateral, totalBorrow, liquidationRatio, borrowFee, accrueInfo]
  )
}

export function useGlobalDEIBorrowed(pools: BorrowPool[]): {
  borrowedBase: string
  borrowedElastic: string
} {
  const contracts = useMemo(() => pools.map((pool) => pool.generalLender), [pools])
  const results = useMultipleContractSingleData(contracts, new Interface(GENERAL_LENDER_ABI), 'totalBorrow', [])

  const elasticSum = useMemo(() => {
    return results.reduce((acc, value, index) => {
      if (value.error || !value.result) return acc
      const amount = formatUnits(value.result[0], pools[index].contract.decimals)
      acc = acc.plus(amount)
      return acc
    }, new BigNumber('0'))
  }, [results, pools])

  const baseSum = useMemo(() => {
    return results.reduce((acc, value, index) => {
      if (value.error || !value.result) return acc
      const amount = formatUnits(value.result[1], pools[index].contract.decimals)
      acc = acc.plus(amount)
      return acc
    }, new BigNumber('0'))
  }, [results, pools])

  return useMemo(
    () => ({
      borrowedBase: baseSum.toString(),
      borrowedElastic: elasticSum.toString(),
    }),
    [baseSum, elasticSum]
  )
}

export function useCollateralPrice(pool: BorrowPool): string {
  const oracleContract = useOracleContract(pool)
  const [price] = useSingleContractMultipleMethods(oracleContract, [{ methodName: 'getPrice', callInputs: [] }])
  return useMemo(() => (price?.result ? formatUnits(price.result[0], 18) : '0'), [price])
}

// TODO ADD CORRECT LOGIC
export function useLiquidationPrice(pool: BorrowPool): string {
  return useMemo(() => 'N/A', [pool])
}

export function useAvailableForWithdrawal(pool: BorrowPool): string {
  const { userCollateral, userDebt } = useUserPoolData(pool)
  const { liquidationRatio } = useGlobalPoolData(pool)
  const collateralPrice = useCollateralPrice(pool)

  /* 
    userCollateral >= userDebt /(liquidationRatio * price)
    const minimumCollateral = userDebt / (liquidationRatio * price)
    userCollateral - withdrawable >= minimumCollateral
    userCollateral - minimumCollateral = withdrawable
    withdrawable = userCollateral - userDebt / (liquidationRatio * price)
  */
  return useMemo(() => {
    if (!parseFloat(collateralPrice) || !parseFloat(userDebt) || !parseFloat(userCollateral)) {
      return '0'
    }
    const liquidationPrice = new BigNumber(liquidationRatio.toSignificant()).div(100).times(collateralPrice)
    const minimumCollateral = new BigNumber(userDebt).div(liquidationPrice)
    const withdrawable = new BigNumber(userCollateral).minus(minimumCollateral)
    return withdrawable.toPrecision(pool.contract.decimals)
  }, [userCollateral, userDebt, liquidationRatio, collateralPrice, pool])
}
