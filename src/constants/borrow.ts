import { Token } from '@sushiswap/core-sdk'

import { CollateralType, LenderVersion, UnserializedBorrowPool } from 'state/borrow/reducer'
import { SupportedChainId } from 'constants/chains'
import BASE_V1_MAIN_PAIR from 'constants/abi/BASE_V1_MAIN_PAIR.json'
import GENERAL_LENDER_V1_ABI from 'constants/abi/GENERAL_LENDER_V1.json'
import GENERAL_LENDER_V2_ABI from 'constants/abi/GENERAL_LENDER_V2.json'
import GENERAL_LENDER_V3_ABI from 'constants/abi/GENERAL_LENDER_V3.json'

export enum MintHelper {
  MAIN = '0x1B7879F4dB7980E464d6B92FDbf9DaA8F1E55073',
  TEST = '0x08cA01cE05E90854Be793B65e7E3BFf5b4c2529D',
}

export const CollateralABI = {
  [CollateralType.SOLIDEX]: BASE_V1_MAIN_PAIR,
  [CollateralType.OXDAO]: BASE_V1_MAIN_PAIR, //TODO:change it to 0xdao token ABI
}

export const LenderABI = {
  [LenderVersion.V1]: GENERAL_LENDER_V1_ABI,
  [LenderVersion.V2]: GENERAL_LENDER_V2_ABI,
  [LenderVersion.V3]: GENERAL_LENDER_V3_ABI,
}

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
  {
    contract: new Token(
      SupportedChainId.FANTOM,
      '0xE9e2f34B0BD4f67E82DD96769d00BB6111aE150E',
      18,
      'Solidex vAMM-DEI/DEUS',
      'sex-vAMM-DEI/DEUS'
    ),
    token0: new Token(SupportedChainId.FANTOM, '0xde12c7959e1a72bbe8a5f7a1dc8f8eef9ab011b3', 18, 'DEI', 'DEI'),
    token1: new Token(SupportedChainId.FANTOM, '0xDE5ed76E7c05eC5e4572CfC88d1ACEA165109E44', 18, 'DEUS', 'DEUS'),
    version: LenderVersion.V2,
    composition: 'DEI/DEUS',
    oracle: '0x9f3C610a731809b6F7630B187777c66194EDf27b',
    generalLender: '0x118FF56bb12E5E0EfC14454B8D7Fa6009487D64E',
    lpPool: '0xF42dBcf004a93ae6D5922282B304E2aEFDd50058',
    mintHelper: MintHelper.MAIN,
    type: CollateralType.SOLIDEX,
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
    token0: new Token(SupportedChainId.FANTOM, '0xde12c7959e1a72bbe8a5f7a1dc8f8eef9ab011b3', 18, 'DEI', 'DEI'),
    token1: new Token(SupportedChainId.FANTOM, '0xDE5ed76E7c05eC5e4572CfC88d1ACEA165109E44', 18, 'DEUS', 'DEUS'),
    version: LenderVersion.V3,
    composition: 'DEI/DEUS',
    oracle: '0x9f3C610a731809b6F7630B187777c66194EDf27b',
    generalLender: '0x39Bc42a405B29789FdFB5Fcc2CbdC0bDc93403F6',
    lpPool: '0xF42dBcf004a93ae6D5922282B304E2aEFDd50058',
    mintHelper: MintHelper.TEST,
    type: CollateralType.SOLIDEX,
    liquidationFee: 5, // 5%
  },
]

export const DeprecatedBorrowPools: UnserializedBorrowPool[] = [
  {
    contract: new Token(
      SupportedChainId.FANTOM,
      '0xE9e2f34B0BD4f67E82DD96769d00BB6111aE150E',
      18,
      'Solidex vAMM-DEI/DEUS',
      'sex-vAMM-DEI/DEUS'
    ),
    token0: new Token(SupportedChainId.FANTOM, '0xde12c7959e1a72bbe8a5f7a1dc8f8eef9ab011b3', 18, 'DEI', 'DEI'),
    token1: new Token(SupportedChainId.FANTOM, '0xDE5ed76E7c05eC5e4572CfC88d1ACEA165109E44', 18, 'DEUS', 'DEUS'),
    version: LenderVersion.V2,
    composition: 'DEI/DEUS',
    oracle: '0x9f3C610a731809b6F7630B187777c66194EDf27b',
    generalLender: '0x6d9d6A0b927FE954700b29380ae7b1B118f58BF1',
    lpPool: '0xF42dBcf004a93ae6D5922282B304E2aEFDd50058',
    mintHelper: MintHelper.MAIN,
    type: CollateralType.SOLIDEX,
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
    token0: new Token(SupportedChainId.FANTOM, '0xde12c7959e1a72bbe8a5f7a1dc8f8eef9ab011b3', 18, 'DEI', 'DEI'),
    token1: new Token(SupportedChainId.FANTOM, '0x04068da6c83afcfa0e13ba15a6696662335d5b75', 6, 'USDC', 'USDC'),
    version: LenderVersion.V2,
    composition: 'USDC/DEI',
    oracle: '0x7D907cF11a3F23d42c5C58426C3b8021F654964C',
    generalLender: '0x1857ca2a664C4E1cD4503f9e0560bC0a9E6f842A',
    lpPool: '0x5821573d8F04947952e76d94f3ABC6d7b43bF8d0',
    mintHelper: MintHelper.MAIN,
    type: CollateralType.SOLIDEX,
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
    token0: new Token(SupportedChainId.FANTOM, '0xde12c7959e1a72bbe8a5f7a1dc8f8eef9ab011b3', 18, 'DEI', 'DEI'),
    token1: new Token(SupportedChainId.FANTOM, '0x04068da6c83afcfa0e13ba15a6696662335d5b75', 6, 'USDC', 'USDC'),
    version: LenderVersion.V1,
    composition: 'USDC/DEI',
    oracle: '0x8878Eb7F44f969D0ed72c6010932791397628546',
    generalLender: '0xeC1Fc57249CEa005fC16b2980470504806fcA20d',
    lpPool: '0x5821573d8F04947952e76d94f3ABC6d7b43bF8d0',
    mintHelper: MintHelper.MAIN,
    type: CollateralType.SOLIDEX,
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
    token0: new Token(SupportedChainId.FANTOM, '0xde12c7959e1a72bbe8a5f7a1dc8f8eef9ab011b3', 18, 'DEI', 'DEI'),
    token1: new Token(SupportedChainId.FANTOM, '0x04068da6c83afcfa0e13ba15a6696662335d5b75', 6, 'USDC', 'USDC'),
    version: LenderVersion.V1,
    composition: 'USDC/DEI',
    oracle: '0x8878Eb7F44f969D0ed72c6010932791397628546',
    generalLender: '0x853CA20E5f059bdbE452e146b91BD6D527f1e0B7',
    lpPool: '0x5821573d8F04947952e76d94f3ABC6d7b43bF8d0',
    mintHelper: MintHelper.MAIN,
    type: CollateralType.SOLIDEX,
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
    token0: new Token(SupportedChainId.FANTOM, '0xde12c7959e1a72bbe8a5f7a1dc8f8eef9ab011b3', 18, 'DEI', 'DEI'),
    token1: new Token(SupportedChainId.FANTOM, '0x04068da6c83afcfa0e13ba15a6696662335d5b75', 6, 'USDC', 'USDC'),
    version: LenderVersion.V1,
    composition: 'USDC/DEI',
    oracle: '0x8878Eb7F44f969D0ed72c6010932791397628546',
    generalLender: '0x1711dD39aC7540E9aa9F7c405c212466534c25f0',
    lpPool: '0x5821573d8F04947952e76d94f3ABC6d7b43bF8d0',
    mintHelper: MintHelper.MAIN,
    type: CollateralType.SOLIDEX,
    liquidationFee: 5, // 5%
  },
]

export const ReimbursePool: UnserializedBorrowPool = {
  contract: new Token(
    SupportedChainId.FANTOM,
    '0xd82001b651f7fb67db99c679133f384244e20e79',
    18,
    'Solidex sAMM-USDC/DEI',
    'sex-sAMM-USDC/DEI'
  ),
  token0: new Token(SupportedChainId.FANTOM, '0xde12c7959e1a72bbe8a5f7a1dc8f8eef9ab011b3', 18, 'DEI', 'DEI'),
  token1: new Token(SupportedChainId.FANTOM, '0x04068da6c83afcfa0e13ba15a6696662335d5b75', 6, 'USDC', 'USDC'),
  version: LenderVersion.V1,
  composition: 'USDC/DEI',
  oracle: '0x8878Eb7F44f969D0ed72c6010932791397628546',
  generalLender: '0x85B6996ab768600C14dA1464205bd6b3a864417D',
  lpPool: '0x5821573d8F04947952e76d94f3ABC6d7b43bF8d0',
  mintHelper: MintHelper.MAIN,
  type: CollateralType.SOLIDEX,
  liquidationFee: 5, // 5%
}
