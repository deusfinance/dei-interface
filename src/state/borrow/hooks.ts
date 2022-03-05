import { useMemo } from 'react'
import { useRouter } from 'next/router'
import { getAddress } from '@ethersproject/address'
import { Currency, Token } from '@sushiswap/core-sdk'
import find from 'lodash/find'
import { AppState, useAppSelector } from 'state'

import { BorrowPool, BorrowState } from './reducer'
import { useCurrency } from 'hooks/useCurrency'
import { constructPercentage } from 'utils/prices'

export function useBorrowState(): BorrowState {
  return useAppSelector((state: AppState) => state.borrow)
}

export function useBorrowPools(): BorrowPool[] {
  const { pools } = useBorrowState()
  return useMemo(() => {
    return pools.map((o) => ({
      ...o,
      interestRate: constructPercentage(o.interestRate),
      borrowFee: constructPercentage(o.borrowFee),
      liquidationFee: constructPercentage(o.liquidationFee),
    }))
  }, [pools])
}

export function useBorrowPoolFromURL(): BorrowPool | null {
  const router = useRouter()
  const contract: string | null = useMemo(() => {
    try {
      const contract = router.query?.contract || undefined
      return typeof contract === 'string' ? getAddress(contract) : null
    } catch (err) {
      // err will be thrown by getAddress invalidation
      return null
    }
  }, [router])

  return useBorrowPoolByContract(contract ?? undefined)
}

export function useBorrowPoolByContract(contract: string | undefined): BorrowPool | null {
  const pools = useBorrowPools()
  return useMemo(() => {
    if (!contract) return null
    const pool = find(pools, (o) => o.contract.toLowerCase() === contract.toLowerCase())
    return pool || null
  }, [contract, pools])
}

export function useCurrenciesFromPool(pool: BorrowPool | undefined): {
  collateralCurrency: Currency | undefined
  pairCurrency: Currency | undefined
} {
  const collateralCurrency = useCurrency(pool?.collateral.address) || undefined
  const pairCurrency = useCurrency(pool?.pair.address) || undefined
  return { collateralCurrency, pairCurrency }
}

export function useAllPoolTokens() {
  const pools = useBorrowPools()
  return useMemo(() => {
    return pools.reduce((acc: Token[], pool) => {
      acc.push(...[pool.collateral, pool.pair])
      return acc
    }, [])
  }, [pools])
}
