import { Token } from '@sushiswap/core-sdk'
import { SupportedChainId } from 'constants/chains'
import {
  BDEI_TOKEN,
  DEI_BDEI_LP_TOKEN,
  DEI_TOKEN,
  DEUS_TOKEN,
  DEUS_VDEUS_LP_TOKEN,
  VDEUS_TOKEN,
} from 'constants/tokens'
import { DB_Pool, DV_Pool } from './addresses'

export type StablePoolType = {
  name: string
  DB_Pool: string
  liquidityTokens: Token[]
  lpToken: Token
  stakingPid: number
  rewardsTokens: Token[]
}

export const StablePools: StablePoolType[] = [
  {
    name: 'DEI-bDEI',
    DB_Pool: DB_Pool[SupportedChainId.FANTOM],
    stakingPid: 1,
    liquidityTokens: [DEI_TOKEN, BDEI_TOKEN],
    lpToken: DEI_BDEI_LP_TOKEN,
    rewardsTokens: [DEUS_TOKEN],
  },
]

export const VDeusLiquidityPools: StablePoolType[] = [
  {
    name: 'DEUS-vDEUS',
    DB_Pool: DV_Pool[SupportedChainId.FANTOM],
    stakingPid: 1,
    liquidityTokens: [VDEUS_TOKEN, DEUS_TOKEN],
    lpToken: DEUS_VDEUS_LP_TOKEN,
    rewardsTokens: [VDEUS_TOKEN],
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
