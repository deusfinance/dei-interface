import { Token } from '@sushiswap/core-sdk'

import { UnserializedBorrowPool } from 'state/borrow/reducer'
import { SupportedChainId } from 'constants/chains'
import CauldronV2FTM from 'constants/abi/pools/CauldronV2FTM.json'

// NOTE: these value are real pools by Abracadabra
export const BorrowPools: UnserializedBorrowPool[] = [
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
