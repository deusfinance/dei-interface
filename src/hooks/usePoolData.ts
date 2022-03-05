import { formatUnits } from '@ethersproject/units'
import { useMemo } from 'react'

import { BorrowPool } from 'state/borrow/reducer'
import { useSingleContractMultipleMethods } from 'state/multicall/hooks'
import { useContract, useMasterContract } from './useContract'
import useWeb3React from './useWeb3'

export function useUserPoolData(pool: BorrowPool): {
  userCollateralShare: number
  userBorrowPart: number
} {
  const { account } = useWeb3React()
  const poolContract = useContract(pool.contract, pool.abi, true)

  const calls = useMemo(
    () =>
      !account
        ? []
        : [
            {
              methodName: 'userCollateralShare',
              callInputs: [account],
            },
            {
              methodName: 'userBorrowPart',
              callInputs: [account],
            },
          ],
    [account]
  )

  const [userCollateralShare, userBorrowPart] = useSingleContractMultipleMethods(poolContract, calls)

  return useMemo(
    () => ({
      userCollateralShare:
        calls.length && userCollateralShare.result
          ? Number(formatUnits(userCollateralShare.result[0], pool.collateral.decimals))
          : 0,
      userBorrowPart:
        calls.length && userBorrowPart.result ? Number(formatUnits(userBorrowPart.result[0], pool.pair.decimals)) : 0,
    }),
    [userCollateralShare]
  )
}

export function useGlobalPoolData(pool: BorrowPool): {
  totalCollateralShare: number
  borrowedElastic: number
  borrowedBase: number
  maxBorrow: number
} {
  const masterContract = useMasterContract()
  const poolContract = useContract(pool.contract, pool.abi, true)

  const poolCalls = [
    {
      methodName: 'totalCollateralShare',
      callInputs: [],
    },
    {
      methodName: 'totalBorrow',
      callInputs: [],
    },
  ]

  const masterCalls = useMemo(
    () => [
      {
        methodName: 'balanceOf',
        callInputs: [pool.collateral.address, pool.contract],
      },
    ],
    [pool]
  )

  const [totalCollateralShare, totalBorrow] = useSingleContractMultipleMethods(poolContract, poolCalls)
  const [maxBorrow] = useSingleContractMultipleMethods(masterContract, masterCalls)

  return useMemo(
    () => ({
      totalCollateralShare: totalCollateralShare.result
        ? Number(formatUnits(totalCollateralShare.result[0], pool.collateral.decimals))
        : 0,
      borrowedElastic: totalBorrow.result ? Number(formatUnits(totalBorrow.result[0], pool.collateral.decimals)) : 0,
      borrowedBase: totalBorrow.result ? Number(formatUnits(totalBorrow.result[1], pool.collateral.decimals)) : 0,
      maxBorrow: maxBorrow.result ? Number(formatUnits(maxBorrow.result[0], pool.pair.decimals)) : 0,
    }),
    [totalCollateralShare, totalBorrow]
  )
}

// TODO use our oracle to get this value
export function useCollateralPrice(pool: BorrowPool): number {
  const collateralPrice = 0.5411
  // example: if wFTM is 2$ => the collateralPrice is 1 / 2 = 0.50$
  return useMemo(() => collateralPrice, [pool])
}
