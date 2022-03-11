import { formatUnits } from '@ethersproject/units'
import { Percent } from '@sushiswap/core-sdk'
import BigNumber from 'bignumber.js'
import { DEI_TOKEN } from 'constants/borrow'
import { useMemo } from 'react'

import { BorrowPool } from 'state/borrow/reducer'
import { useSingleCallResult, useSingleContractMultipleMethods } from 'state/multicall/hooks'
import { constructPercentage } from 'utils/prices'
import { useContract, useGeneralLenderContract, useLenderManagerContract, useLenderOracleContract } from './useContract'
import useWeb3React from './useWeb3'

export function useUserPoolData(pool: BorrowPool): {
  userCollateral: string
  userBorrow: string
  userCap: string
  userDebt: string
} {
  const { account } = useWeb3React()
  const generalLenderContract = useGeneralLenderContract()
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
  const generalLenderContract = useGeneralLenderContract()

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

// TODO THIS IS INCORRECT, SHOULD BE A POOL DEPENDENT CONTRACT ADDRESS
export function useCollateralPrice(pool: BorrowPool): string {
  const oracleContract = useLenderOracleContract()
  const price = useSingleCallResult(oracleContract, 'getPrice', [])
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
  }, [userCollateral, userDebt, liquidationRatio, collateralPrice])
}
