// todo: figure out how env vars actually work in CI
// const TEST_PRIVATE_KEY = Cypress.env('INTEGRATION_TEST_PRIVATE_KEY')
import { Wallet } from '@ethersproject/wallet'
import { truncateAddress } from '../../src/utils/account'

export const TEST_PRIVATE_KEY = '0xe580410d7c37d26c6ad1a837bbae46bc27f9066a466fb3a66e770523b4666d19'
export const TEST_PRIVATE_KEY_2 = '0x79a326abd4d35c206ed5365ff067ae2ab3bebc64865a7eb0b1c1ceedf037647b'

// address of the above key
export const TEST_ADDRESS_NEVER_USE = new Wallet(TEST_PRIVATE_KEY).address
export const TEST_ADDRESS_NEVER_USE_2 = new Wallet(TEST_PRIVATE_KEY_2).address

export const TEST_ADDRESS_NEVER_USE_SHORTENED = truncateAddress(TEST_ADDRESS_NEVER_USE)!

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

export const veNFTTokens = [
  {
    tokenId: 32824,
    needsAmount: 1000000000000,
    endTime: 1776902400,
    approved: ZERO_ADDRESS,
  },
  {
    tokenId: 14278,
    needsAmount: 2000000000000,
    endTime: 1776900400,
    approved: TEST_ADDRESS_NEVER_USE,
  },
  {
    tokenId: 54278,
    needsAmount: 2000000000000,
    endTime: 1776900400,
    approved: TEST_ADDRESS_NEVER_USE_2,
  },
]

export const tokenListSorted = veNFTTokens.sort((a: any, b: any) => a.tokenId - b.tokenId)
