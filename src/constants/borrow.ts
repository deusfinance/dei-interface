import { Token } from '@sushiswap/core-sdk'

import { CollateralType, LenderVersion, UnserializedBorrowPool } from 'state/borrow/reducer'
import { SupportedChainId } from 'constants/chains'

// TODO SWITCH THIS TOKEN WITH THE BELOW COMMENTED OUT TOKEN FOR PRODUCTION RELEASE
export const DEI_TOKEN_TEST = new Token(
  SupportedChainId.FANTOM,
  '0x4A4573B03B0800e24dEcD8fE497BFeD98ee344B8',
  18,
  'TDEI',
  'TestDEI'
)

export const DEI_TOKEN = new Token(
  SupportedChainId.FANTOM,
  '0xDE12c7959E1a72bbe8a5f7A1dc8f8EeF9Ab011B3',
  18,
  'DEI',
  'DEI'
)

export enum MintHelper {
  MAIN = '0x1B7879F4dB7980E464d6B92FDbf9DaA8F1E55073',
  TEST = '0xb0F1266119E14913e0f2F26E65351B972Bee843d',
}

export const BorrowPools: UnserializedBorrowPool[] = [
  {
    contract: new Token(
      SupportedChainId.FANTOM,
      '0xE9e2f34B0BD4f67E82DD96769d00BB6111aE150E',
      18,
      'Solidex vAMM-DEI/DEUS',
      'sex-vAMM-DEI/DEUS'
    ),
    dei: DEI_TOKEN,
    token0: new Token(SupportedChainId.FANTOM, '0xde12c7959e1a72bbe8a5f7a1dc8f8eef9ab011b3', 18, 'DEI', 'DEI'),
    token1: new Token(SupportedChainId.FANTOM, '0xDE5ed76E7c05eC5e4572CfC88d1ACEA165109E44', 18, 'DEUS', 'DEUS'),
    version: LenderVersion.V2,
    mintHelper: MintHelper.MAIN,
    type: CollateralType.SOLIDEX,
    composition: 'DEI/DEUS',
    oracle: '0x9f3C610a731809b6F7630B187777c66194EDf27b',
    generalLender: '0x118FF56bb12E5E0EfC14454B8D7Fa6009487D64E',
    lpPool: '0xF42dBcf004a93ae6D5922282B304E2aEFDd50058',
    liquidationFee: 5, // 5%
  },
  {
    contract: new Token(
      SupportedChainId.FANTOM,
      '0xd82001b651f7fb67db99c679133f384244e20e79',
      18,
      'Solidex sAMM-USDC/DEI',
      'sex-sAMM-USDC/DEI'
    ),
    dei: DEI_TOKEN,
    token0: new Token(SupportedChainId.FANTOM, '0xde12c7959e1a72bbe8a5f7a1dc8f8eef9ab011b3', 18, 'DEI', 'DEI'),
    token1: new Token(SupportedChainId.FANTOM, '0x04068da6c83afcfa0e13ba15a6696662335d5b75', 6, 'USDC', 'USDC'),
    version: LenderVersion.V2,
    composition: 'USDC/DEI',
    oracle: '0x7D907cF11a3F23d42c5C58426C3b8021F654964C',
    generalLender: '0x8D643d954798392403eeA19dB8108f595bB8B730',
    lpPool: '0x5821573d8F04947952e76d94f3ABC6d7b43bF8d0',
    mintHelper: MintHelper.MAIN,
    type: CollateralType.SOLIDEX,
    liquidationFee: 5, // 5%
  },
  //*********V3 TEST LENDER************** //
  //******Remove it in production************** //
  {
    id: 0,
    contract: new Token(
      SupportedChainId.FANTOM,
      '0xE9e2f34B0BD4f67E82DD96769d00BB6111aE150E',
      18,
      'Solidex vAMM-DEI/DEUS',
      'sex-vAMM-DEI/DEUS'
    ),
    dei: DEI_TOKEN_TEST,
    token0: new Token(SupportedChainId.FANTOM, '0xde12c7959e1a72bbe8a5f7a1dc8f8eef9ab011b3', 18, 'DEI', 'DEI'),
    token1: new Token(SupportedChainId.FANTOM, '0xDE5ed76E7c05eC5e4572CfC88d1ACEA165109E44', 18, 'DEUS', 'DEUS'),
    version: LenderVersion.V3,
    composition: 'DEI/DEUS *',
    oracle: '0x9f3C610a731809b6F7630B187777c66194EDf27b',
    generalLender: '0x06A329026e44E91Ea2d28A0e2C06E192df009e7F',
    lpPool: '0xF42dBcf004a93ae6D5922282B304E2aEFDd50058',
    mintHelper: MintHelper.TEST,
    type: CollateralType.SOLIDEX,
    liquidationFee: 5,
  },
  //*********V3 TEST LENDER************** //
  //******Remove it in production************** //
  {
    id: 1,
    contract: new Token(
      SupportedChainId.FANTOM,
      '0xF42dBcf004a93ae6D5922282B304E2aEFDd50058',
      18,
      'vAMM-DEI/DEUS',
      'vAMM-DEI/DEUS'
    ),
    dei: DEI_TOKEN_TEST,
    token0: new Token(SupportedChainId.FANTOM, '0xde12c7959e1a72bbe8a5f7a1dc8f8eef9ab011b3', 18, 'DEI', 'DEI'),
    token1: new Token(SupportedChainId.FANTOM, '0xDE5ed76E7c05eC5e4572CfC88d1ACEA165109E44', 18, 'DEUS', 'DEUS'),
    version: LenderVersion.V3,
    composition: 'DEI/DEUS *',
    oracle: '0x9f3C610a731809b6F7630B187777c66194EDf27b',
    generalLender: '0x06A329026e44E91Ea2d28A0e2C06E192df009e7F',
    lpPool: '0xF42dBcf004a93ae6D5922282B304E2aEFDd50058',
    mintHelper: MintHelper.TEST,
    type: CollateralType.OXDAO,
    liquidationFee: 5,
  },
]
