import { Token } from '@sushiswap/core-sdk'
import { BDEI_TOKEN, DEI_TOKEN, DEUS_TOKEN, VDEUS_TOKEN } from 'constants/tokens'

export type StakingType = {
  name: string
  tokens: Token[]
  rewardTokens: Token[]
  active: boolean
}

export const Stakings: StakingType[] = [
  {
    name: 'DEI-bDEI',
    tokens: [DEI_TOKEN, BDEI_TOKEN],
    rewardTokens: [DEUS_TOKEN],
    active: true,
  },
  {
    name: 'bDEI',
    tokens: [BDEI_TOKEN],
    rewardTokens: [DEUS_TOKEN],
    active: true,
  },
  {
    name: 'DEUS-vDEUS',
    tokens: [DEUS_TOKEN, VDEUS_TOKEN],
    rewardTokens: [DEUS_TOKEN],
    active: true,
  },
  {
    name: 'vDEUS',
    tokens: [VDEUS_TOKEN],
    rewardTokens: [DEUS_TOKEN, VDEUS_TOKEN],
    active: true,
  },
  {
    name: 'vDEUS NFT',
    tokens: [VDEUS_TOKEN],
    rewardTokens: [DEUS_TOKEN, VDEUS_TOKEN],
    active: false,
  },
]
