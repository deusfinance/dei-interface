import { Token } from '@sushiswap/core-sdk'

import { UnserializedBorrowPool } from 'state/borrow/reducer'
import { SupportedChainId } from 'constants/chains'
import BASE_V1_MAIN_PAIR from 'constants/abi/BASE_V1_MAIN_PAIR.json'

// TODO SWITCH THIS TOKEN WITH THE BELOW COMMENTED OUT TOKEN FOR PRODUCTION RELEASE
// export const DEI_TOKEN = new Token(
//   SupportedChainId.FANTOM,
//   '0x4A4573B03B0800e24dEcD8fE497BFeD98ee344B8',
//   18,
//   'TDEI',
//   'TestDEI'
// )

export const DEI_TOKEN = new Token(
  SupportedChainId.FANTOM,
  '0xDE12c7959E1a72bbe8a5f7A1dc8f8EeF9Ab011B3',
  18,
  'DEI',
  'DEI'
)

export const BorrowPools: UnserializedBorrowPool[] = [
  {
    contract: new Token(
      SupportedChainId.FANTOM,
      '0xd82001b651f7fb67db99c679133f384244e20e79',
      18,
      'Solidex sAMM-USDC/DEI',
      'sex-sAMM-USDC/DEI'
    ),
    token0: new Token(SupportedChainId.FANTOM, '0xde12c7959e1a72bbe8a5f7a1dc8f8eef9ab011b3', 18, 'DEI', 'DEI'),
    token1: new Token(SupportedChainId.FANTOM, '0x04068da6c83afcfa0e13ba15a6696662335d5b75', 6, 'USDC', 'USDC'),
    abi: BASE_V1_MAIN_PAIR,
    composition: 'USDC/DEI',
    oracle: '0x8878Eb7F44f969D0ed72c6010932791397628546',
    generalLender: '0xeC1Fc57249CEa005fC16b2980470504806fcA20d',
    lpPool: '0x5821573d8F04947952e76d94f3ABC6d7b43bF8d0',
    mintHelper: '0x1B7879F4dB7980E464d6B92FDbf9DaA8F1E55073',
    type: 'Solidex LP Token',
    liquidationFee: 5, // 5%
  },
]
