import { Token } from '@sushiswap/core-sdk'
import { BDEI_TOKEN, DEI_BDEI_LP_TOKEN } from 'constants/tokens'

export type StakingType = {
  name: string
  pid: number
  token: Token
  provideLink?: string
}

export const StakingPools: StakingType[] = [
  {
    name: 'bDEI',
    pid: 0,
    token: BDEI_TOKEN,
    provideLink: '/deibonds',
  },
  {
    name: 'DEI-bDEI',
    pid: 1,
    token: DEI_BDEI_LP_TOKEN,
    provideLink: '/deibonds',
  },
]
