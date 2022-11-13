import { Token } from '@sushiswap/core-sdk'
import { BDEI_TOKEN, DEI_BDEI_LP_TOKEN, DEUS_VDEUS_LP_TOKEN, VDEUS_TOKEN } from 'constants/tokens'
import { MasterChefV2, MasterChefV3 } from './addresses'
import { SupportedChainId } from './chains'

export type StakingType = {
  name: string
  pid: number
  token: Token
  provideLink?: string
  masterChef: string
  version: string
}

export type vDeusStakingType = {
  id: number
  name: string
  pid: number
  apr: number
  lockDuration: number
  lpToken: string
  provideLink?: string
}

export const StakingPools: StakingType[] = [
  {
    name: 'bDEI',
    pid: 0,
    token: BDEI_TOKEN,
    provideLink: '/deibonds',
    masterChef: MasterChefV2[SupportedChainId.FANTOM],
    version: 'v1',
  },
  {
    name: 'DEI-bDEI',
    pid: 1,
    token: DEI_BDEI_LP_TOKEN,
    provideLink: '/deibonds',
    masterChef: MasterChefV2[SupportedChainId.FANTOM],
    version: 'v1',
  },
]

export const StakingPools2: StakingType[] = [
  {
    name: 'vDEUS(ERC20)',
    pid: 0,
    token: VDEUS_TOKEN,
    provideLink: '/vdeus/new',
    masterChef: MasterChefV3[SupportedChainId.FANTOM],
    version: 'v2',
  },
  {
    name: 'DEUS-vDEUS',
    pid: 2,
    token: DEUS_VDEUS_LP_TOKEN,
    provideLink: '/vdeus/new',
    masterChef: MasterChefV3[SupportedChainId.FANTOM],
    version: 'v2',
  },
]

export type UserDeposit = {
  nftId: number
  poolId: number
  amount: number
  depositTimestamp: number
  isWithdrawn: boolean
  isExited: boolean
}

export const vDeusStakingPools: vDeusStakingType[] = [
  {
    id: 0,
    name: '3 Months',
    pid: 0,
    apr: 10,
    lpToken: '0x24651a470D08009832d62d702d1387962A2E5d60',
    lockDuration: 180,
    provideLink: '/redeem',
  },
  {
    id: 1,
    name: '6 Months',
    pid: 1,
    lpToken: '0x65875f75d5CDEf890ea97ADC43E216D3f0c2b2D8',
    apr: 20,
    lockDuration: 360,
    provideLink: '/redeem',
  },
  {
    id: 2,
    name: '1 Year',
    pid: 2,
    lpToken: '0xCf18eCa0EaC101eb47828BFd460D1922000213db',
    apr: 40,
    lockDuration: 720,
    provideLink: '/redeem',
  },
]
