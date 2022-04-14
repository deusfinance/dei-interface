import { useMemo } from 'react'
import { formatUnits } from '@ethersproject/units'
import { Percent } from '@sushiswap/core-sdk'
import { Contract } from '@ethersproject/contracts'
import { Interface } from '@ethersproject/abi'
import { AddressZero } from '@ethersproject/constants'
import { useTheme } from 'styled-components'
import BigNumber from 'bignumber.js'

import { BorrowPool, HealthType, LenderVersion } from 'state/borrow/reducer'
import { useMultipleContractSingleData, useSingleContractMultipleMethods } from 'state/multicall/hooks'
import { useGeneralLenderContract, useHolderManager, useOracleContract } from 'hooks/useContract'
import useWeb3React from 'hooks/useWeb3'

import GENERAL_LENDER_ABI from 'constants/abi/GENERAL_LENDER_V1.json'
import { DEI_TOKEN } from 'constants/borrow'
import { constructPercentage, ONE_HUNDRED_PERCENT } from 'utils/prices'
import { BN_ZERO, BN_ONE_HUNDRED } from 'utils/numbers'
import { getGlobalPoolDataCalls, getUserPoolDataCalls } from 'utils/borrow/calls'

export function useUserPoolData(pool: BorrowPool): {
  userCollateral: string
  userBorrow: string
  userDebt: string
  userHolder: string
} {
  const { account } = useWeb3React()
  const isV2 = pool.version == LenderVersion.V2
  const generalLenderContract = useGeneralLenderContract(pool)
  const holderManagerContract = useHolderManager()
  const collateralBorrowCalls = getUserPoolDataCalls(pool, account)

  const [userCollateral, userBorrow, userDebt] = useSingleContractMultipleMethods(
    generalLenderContract,
    collateralBorrowCalls
  )

  const { userCollateralValue, userBorrowValue, userDebtValue } = useMemo(
    () => ({
      userCollateralValue:
        collateralBorrowCalls.length && userCollateral?.result
          ? formatUnits(userCollateral.result[0], pool.contract.decimals)
          : '0',
      userBorrowValue:
        collateralBorrowCalls.length && userBorrow?.result
          ? formatUnits(userBorrow.result[0], DEI_TOKEN.decimals)
          : '0',
      userDebtValue:
        collateralBorrowCalls.length && userDebt?.result ? formatUnits(userDebt.result[0], DEI_TOKEN.decimals) : '0',
    }),
    [collateralBorrowCalls, userCollateral, userBorrow, userDebt, pool]
  )

  const holderContract = isV2 ? generalLenderContract : holderManagerContract
  const userHolderCalls = useMemo(
    () =>
      !account
        ? []
        : [
            {
              methodName: isV2 ? 'userHolder' : 'getHolder',
              callInputs: isV2 ? [account] : [pool.contract.address, account],
            },
          ],
    [account, isV2, pool]
  )
  const userHolderAddress = useGetHolder(holderContract, userHolderCalls)

  return useMemo(
    () => ({
      userCollateral: userCollateralValue,
      userBorrow: userBorrowValue,
      userDebt: userDebtValue,
      userHolder: userHolderAddress,
    }),
    [userCollateralValue, userBorrowValue, userDebtValue, userHolderAddress]
  )
}

export function useGetHolder(contract: Contract | null, calls: any): string {
  const [userHolder] = useSingleContractMultipleMethods(contract, calls)
  const userHolderAddress = useMemo(
    () => (calls.length && userHolder?.result ? userHolder?.result[0].toString() : AddressZero),
    [calls, userHolder]
  )
  return userHolderAddress
}

export function useGlobalPoolData(pool: BorrowPool): {
  maxCap: string
  totalCollateral: string
  borrowedElastic: string
  borrowedBase: string
  liquidationRatio: Percent
  borrowFee: Percent
  feesEarned: string
  interestPerSecond: number
} {
  const generalLenderContract = useGeneralLenderContract(pool)
  const calls = getGlobalPoolDataCalls(pool)

  const [maxCap, totalCollateral, totalBorrow, liquidationRatio, borrowFee, accrueInfo] =
    useSingleContractMultipleMethods(generalLenderContract, calls)

  return useMemo(
    () => ({
      maxCap: maxCap?.result ? formatUnits(maxCap.result[0], pool.contract.decimals) : '0',
      totalCollateral: totalCollateral?.result ? formatUnits(totalCollateral.result[0], pool.contract.decimals) : '0',
      borrowedElastic: totalBorrow?.result ? formatUnits(totalBorrow.result[0], pool.contract.decimals) : '0',
      borrowedBase: totalBorrow?.result ? formatUnits(totalBorrow.result[1], pool.contract.decimals) : '0',
      liquidationRatio: liquidationRatio?.result
        ? constructPercentage(parseFloat(formatUnits(liquidationRatio.result[0], 18))) // LIQUIDATION_RATIO_PRECISION
        : constructPercentage(0.8),
      borrowFee: borrowFee?.result
        ? constructPercentage(parseFloat(formatUnits(borrowFee.result[0], 18))) // BORROW_OPENING_FEE_PRECISION
        : constructPercentage(0.005),
      feesEarned:
        accrueInfo?.result && accrueInfo?.result?.feesEarned ? formatUnits(accrueInfo.result.feesEarned, 18) : '0',
      interestPerSecond: accrueInfo?.result ? parseFloat(formatUnits(accrueInfo.result.interestPerSecond, 18)) : 0,
    }),
    [pool, maxCap, totalCollateral, totalBorrow, liquidationRatio, borrowFee, accrueInfo]
  )
}

//TODO:reject v3 pool borrow amounts
export function useGlobalDEIBorrowed(ipools: BorrowPool[]): {
  borrowedBase: string
  borrowedElastic: string
} {
  const pools = ipools.filter((pool) => pool.version !== LenderVersion.V3)
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
      borrowedBase: baseSum.toFixed(),
      borrowedElastic: elasticSum.toFixed(),
    }),
    [baseSum, elasticSum]
  )
}

//TODO: needs to get data from api(al least muon oracle api)
export function useCollateralPrice(pool: BorrowPool): string {
  const oracleContract = useOracleContract(pool)
  const methodName = pool.version == LenderVersion.V1 ? 'getPrice' : 'getOnChainPrice'
  const [price] = useSingleContractMultipleMethods(oracleContract, [{ methodName, callInputs: [] }])
  return useMemo(() => (price?.result ? formatUnits(price.result[0], 18) : '0'), [price])
}

export function useAvailableForWithdrawal(pool: BorrowPool): {
  availableForWithdrawal: string
  availableForWithdrawalFactored: string
} {
  const { userCollateral, userDebt } = useUserPoolData(pool)
  const { liquidationRatio } = useGlobalPoolData(pool)
  const collateralPrice = useCollateralPrice(pool)

  const result = useMemo(() => {
    if (!parseFloat(collateralPrice) || !parseFloat(userCollateral)) {
      return '0'
    }

    const liquidationPrice = new BigNumber(liquidationRatio.toSignificant()).div(100).times(collateralPrice)
    const minimumCollateral = new BigNumber(userDebt).div(liquidationPrice)
    const withdrawable = new BigNumber(userCollateral).minus(minimumCollateral)
    return withdrawable.gt(0) ? withdrawable.toPrecision(pool.contract.decimals) : '0'
  }, [userCollateral, userDebt, liquidationRatio, collateralPrice, pool])

  return {
    availableForWithdrawal: result,
    availableForWithdrawalFactored: new BigNumber(result).times(0.995).toFixed(),
  }
}

export function useAvailableToBorrow(pool: BorrowPool): string {
  const { userCollateral } = useUserPoolData(pool)
  const { liquidationRatio, borrowFee } = useGlobalPoolData(pool)
  const collateralPrice = useCollateralPrice(pool)
  const { availableForWithdrawal } = useAvailableForWithdrawal(pool)

  const borrowFeeMultiplier = useMemo(() => {
    return ONE_HUNDRED_PERCENT.subtract(borrowFee).divide(100).toSignificant()
  }, [borrowFee])

  return useMemo(() => {
    if (!parseFloat(collateralPrice) || !parseFloat(userCollateral) || !parseFloat(availableForWithdrawal)) {
      return '0'
    }
    return new BigNumber(availableForWithdrawal)
      .times(collateralPrice)
      .times(liquidationRatio.toSignificant())
      .div(100)
      .times(borrowFeeMultiplier)
      .times(1 - 0.005) //1 - health ratio
      .toPrecision(pool.contract.decimals)
  }, [userCollateral, liquidationRatio, availableForWithdrawal, collateralPrice, pool, borrowFeeMultiplier])
}

export function useLiquidationPrice(pool: BorrowPool): string {
  const { liquidationRatio } = useGlobalPoolData(pool)
  const { userCollateral, userDebt } = useUserPoolData(pool)
  return useMemo(() => {
    if (!liquidationRatio || !parseFloat(userCollateral) || !parseFloat(userDebt)) {
      return '0'
    }
    const liquidationPrice = new BigNumber(userDebt)
      .div(liquidationRatio.toSignificant())
      .times(100)
      .div(userCollateral)

    return liquidationPrice.toPrecision(pool.contract.decimals)
  }, [userCollateral, userDebt, liquidationRatio, pool])
}

export function useHealthRatio(pool: BorrowPool): [string, any, string] {
  const theme = useTheme()
  const liquidationPrice = useLiquidationPrice(pool)
  const collateralPrice = useCollateralPrice(pool)
  const { userCollateral } = useUserPoolData(pool)

  const healthRatio = useMemo(() => {
    if (userCollateral && parseFloat(userCollateral) && parseFloat(liquidationPrice) == 0) return BN_ONE_HUNDRED
    if (!liquidationPrice || !collateralPrice || !parseFloat(liquidationPrice) || !parseFloat(collateralPrice)) {
      return BN_ZERO
    }
    const deathRatio = new BigNumber(liquidationPrice).div(collateralPrice)
    const healthRatioBN = new BigNumber(1).minus(deathRatio).times(100)
    return healthRatioBN
  }, [liquidationPrice, collateralPrice, userCollateral])

  const healthLevel = useMemo(() => {
    return parseFloat(userCollateral) == 0
      ? HealthType.DEFAULT
      : healthRatio.gte(70)
      ? HealthType.SAFE
      : healthRatio.gte(40)
      ? HealthType.MEDIUM
      : healthRatio.gte(25)
      ? HealthType.RISKY
      : HealthType.HIGH_RISK
  }, [healthRatio, userCollateral])

  const color = useMemo(() => {
    return healthLevel == HealthType.SAFE
      ? theme.green1
      : healthLevel == HealthType.MEDIUM
      ? theme.yellow2
      : healthLevel == HealthType.RISKY || healthLevel == HealthType.HIGH_RISK
      ? theme.red1
      : theme.text1
  }, [healthLevel, theme])

  return [healthRatio.toFixed(0) + '%', color, healthLevel.toString()]
}
