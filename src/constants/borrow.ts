import { Token } from '@sushiswap/core-sdk'

import { UnserializedBorrowPool } from 'state/borrow/reducer'
import { SupportedChainId } from 'constants/chains'
import BASE_V1_PAIR from 'constants/abi/BASE_V1_PAIR.json'

// TODO SWITCH THIS TOKEN WITH THE BELOW COMMENTED OUT TOKEN FOR PRODUCTION RELEASE
export const DEI_TOKEN = new Token(
  SupportedChainId.FANTOM,
  '0x4A4573B03B0800e24dEcD8fE497BFeD98ee344B8',
  18,
  'TDEI',
  'TestDEI'
)
// export const DEI_TOKEN = new Token(
//   SupportedChainId.FANTOM,
//   '0xDE12c7959E1a72bbe8a5f7A1dc8f8EeF9Ab011B3',
//   18,
//   'DEI',
//   'DEI'
// )

export const BorrowPools: UnserializedBorrowPool[] = [
  // THIS IS A TEST POOL, DELETE THIS WHEN IN PRODUCTION
  {
    contract: new Token(
      SupportedChainId.FANTOM,
      '0x24e96523c98911589C45CBB9C5DB5E2354B2adCe',
      18,
      'StableV1 AMM - TDEI/TUSDC',
      'sAMM-TDEI/TUSDC'
    ),
    token0: new Token(SupportedChainId.FANTOM, '0xCD9a7E6383F218e13c868c2328E9F4ad8a65f312', 18, 'TUSDC', 'TestUSDC'),
    token1: new Token(SupportedChainId.FANTOM, '0x4A4573B03B0800e24dEcD8fE497BFeD98ee344B8', 18, 'TDEI', 'TestDEI'),
    abi: BASE_V1_PAIR,
    composition: 'TUSDC/TDEI',
    oracle: '0x45716366916E10322067921A463111bA6b4770dE',
    generalLender: '0xc654d54d5404c1d92dB820a3C04041B957A43aD6',
    type: 'SpiritSwap LP Tokens',
    liquidationFee: 5, // 5%
  },
  // THIS IS A PRODUCTION POOL, POPULATE THE VALUES THAT SAY 'MODIFY THIS' WITH THE CORRECT ADDRESS FOR PRODUCTION RELEASE
  {
    contract: new Token(
      SupportedChainId.FANTOM,
      '0x5821573d8F04947952e76d94f3ABC6d7b43bF8d0', // MODIFY THIS
      18,
      'Solidex sAMM-USDC/DEI', // MODIFY THIS
      'sex-sAMM-USDC/DEI' // MODIFY THIS
    ),
    token0: new Token(SupportedChainId.FANTOM, '0xde12c7959e1a72bbe8a5f7a1dc8f8eef9ab011b3', 18, 'DEI', 'DEI'),
    token1: new Token(SupportedChainId.FANTOM, '0x04068da6c83afcfa0e13ba15a6696662335d5b75', 18, 'USDC', 'USDC'),
    abi: BASE_V1_PAIR, // MODIFY THIS
    composition: 'USDC/DEI',
    oracle: '0x45716366916E10322067921A463111bA6b4770dE', // MODIFY THIS
    generalLender: '0xc654d54d5404c1d92dB820a3C04041B957A43aD6', // MODIFY THIS
    type: 'Solidex LP Token', // MODIFY THIS
    liquidationFee: 5, // 5%
  },
]
