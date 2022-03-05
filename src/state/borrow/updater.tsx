import { useEffect } from 'react'
import { Token } from '@sushiswap/core-sdk'
import { useAppDispatch } from 'state'

import { setPools, UnserializedBorrowPool } from './reducer'
import { SupportedChainId } from 'constants/chains'
import CauldronV2FTM from 'constants/abi/pools/CauldronV2FTM.json'

// TODO move this to constants for prod
// NOTE: these value are real pools by Abracadabra
const FakePools: UnserializedBorrowPool[] = [
  {
    contract: '0x8e45af6743422e488afacdad842ce75a09eaed34',
    abi: CauldronV2FTM,
    composition: 'wFTM/MIM',
    collateral: new Token(
      SupportedChainId.FANTOM,
      '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83',
      18,
      'wFTM',
      'Wrapped Fantom'
    ),
    pair: new Token(
      SupportedChainId.FANTOM,
      '0x82f0B8B456c1A451378467398982d4834b6829c1',
      18,
      'MIM',
      'Magic Internet Money'
    ),
    ltv: 75,
    interestRate: 0.035,
    borrowFee: 0.0005,
    liquidationFee: 0.125,
  },
]

export default function Updater(): null {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(setPools(FakePools))
  }, [dispatch])

  return null
}
