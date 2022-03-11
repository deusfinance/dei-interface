import { Token } from '@sushiswap/core-sdk'

import { UnserializedBorrowPool } from 'state/borrow/reducer'
import { SupportedChainId } from 'constants/chains'
import BASE_V1_PAIR from 'constants/abi/BASE_V1_PAIR.json'

// TODO NEEDS CHANGING
export const DEI_TOKEN = new Token(
  SupportedChainId.FANTOM,
  '0x4A4573B03B0800e24dEcD8fE497BFeD98ee344B8',
  18,
  'TDEI',
  'TestDEI'
)

export const BorrowPools: UnserializedBorrowPool[] = [
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
    type: 'SpiritSwap LP Tokens',
    interestRate: 0.035,
    borrowFee: 0.0005,
    liquidationFee: 0.125,
  },
]
