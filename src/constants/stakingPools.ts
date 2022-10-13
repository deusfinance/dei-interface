import { Token } from '@sushiswap/core-sdk'
import {
  BDEI_TOKEN,
  DEI_BDEI_LP_TOKEN,
  DEI_TOKEN,
  DEUS_TOKEN,
  DEUS_VDEUS_LP_TOKEN,
  VDEUS_TOKEN,
} from 'constants/tokens'

export type StakingType = {
  name: string
  pid: number
  tokens: Token[]
  lpToken: Token
  rewardTokens: Token[]
  active: boolean
}

export const Stakings: StakingType[] = [
  {
    name: 'DEI-bDEI',
    pid: 0,
    tokens: [DEI_TOKEN, BDEI_TOKEN],
    lpToken: DEI_BDEI_LP_TOKEN,
    rewardTokens: [DEUS_TOKEN],
    active: true,
  },
  {
    name: 'bDEI',
    pid: 1,
    tokens: [BDEI_TOKEN],
    lpToken: BDEI_TOKEN,
    rewardTokens: [DEUS_TOKEN],
    active: true,
  },
  {
    name: 'DEUS-vDEUS',
    pid: 2,
    tokens: [DEUS_TOKEN, VDEUS_TOKEN],
    lpToken: DEUS_VDEUS_LP_TOKEN,
    rewardTokens: [DEUS_TOKEN],
    active: true,
  },
  {
    name: 'vDEUS',
    pid: 3,
    tokens: [VDEUS_TOKEN],
    lpToken: VDEUS_TOKEN,
    rewardTokens: [DEUS_TOKEN, VDEUS_TOKEN],
    active: true,
  },
  {
    name: 'vDEUS NFT',
    pid: 4,
    tokens: [VDEUS_TOKEN],
    lpToken: VDEUS_TOKEN,
    rewardTokens: [DEUS_TOKEN, VDEUS_TOKEN],
    active: false,
  },
]
