import { Token } from '@sushiswap/core-sdk'
import { SupportedChainId } from 'constants/chains'
import { BDEI_TOKEN, DEI_TOKEN, DEUS_TOKEN } from 'constants/tokens'

export type StablePoolType = {
  name: string
  swapFlashLoan: string
  liquidityTokens: Token[]
  lpToken: Token
  stakingContract: string
  rewardsTokens: Token[]
}

export const StablePools: StablePoolType[] = [
  {
    name: 'DEI-bDEI',
    swapFlashLoan: '0x9caC3CE5D8327aa5AF54b1b4e99785F991885Bf3',
    stakingContract: '0x9caC3CE5D8327aa5AF54b1b4e99785F991885Bf3',
    liquidityTokens: [DEI_TOKEN, BDEI_TOKEN],
    lpToken: new Token(
      SupportedChainId.FANTOM,
      '0xde12c7959e1a72bbe8a5f7a1dc8f8eef9ab011b3',
      18,
      'DEI-bDEI-LP',
      'DEI-bDEI-LP'
    ),
    rewardsTokens: [DEUS_TOKEN],
  },
]

export function getTokenIndex(symbolOrAddress: string, pool: StablePoolType): number | null {
  const { liquidityTokens: tokens } = pool
  for (let index = 0; index < tokens.length; index++) {
    if (
      symbolOrAddress.toLowerCase() == tokens[index].address.toLowerCase() ||
      symbolOrAddress.toLowerCase() == tokens[index].symbol?.toLowerCase()
    )
      return index
  }
  return null
}
