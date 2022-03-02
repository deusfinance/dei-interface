import { useMemo } from 'react'
import { useRouter } from 'next/router'
import { getAddress } from '@ethersproject/address'
import { Percent } from '@sushiswap/core-sdk'
import find from 'lodash/find'

import { constructPercentage } from 'utils/prices'

// this hook should get its data from our store state
// store should keep a list of assets, with already applied stats (type, borrowed, left to borrow, interest, liq fee)
// list should be using our multicall hook so its updated per-block :)

export interface BorrowComponent {
  contract: string
  component: string
  type: string
  totalBorrowed: string
  remaining: string
  interest: Percent
  liquidationFee: Percent
}

const FakeList: BorrowComponent[] = [
  {
    contract: '0x0000000000000000000000000000000000000000',
    component: 'FTM/LQDR',
    type: 'Spiritswap LP Tokens',
    totalBorrowed: '18760',
    remaining: '7850',
    interest: constructPercentage(0.04),
    liquidationFee: constructPercentage(0.125),
  },
  {
    contract: '0x0000000000000000000000000000000000000001',
    component: 'veNFT',
    type: 'Solidly Voting Token',
    totalBorrowed: '1500',
    remaining: '189',
    interest: constructPercentage(0.03),
    liquidationFee: constructPercentage(0.07),
  },
]

export default function useBorrowList(): BorrowItem[] {
  return useMemo(() => FakeList, [])
}

export function useBorrowComponentFromURL(): BorrowItem | null {
  const router = useRouter()
  const list = useBorrowList()

  const contract: string | null = useMemo(() => {
    try {
      const contract = router.query?.contract || undefined
      return typeof contract === 'string' ? getAddress(contract) : null
    } catch (err) {
      // err is thrown by getAddress validation
      return null
    }
  }, [router])

  return useMemo(() => {
    if (!contract) return null
    const component = find(list, { contract })
    return component || null
  }, [contract, list])
}
