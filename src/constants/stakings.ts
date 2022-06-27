import { Token } from '@sushiswap/core-sdk'
import { BDEI_TOKEN, DEI_BDEI_LP_TOKEN } from 'constants/tokens'

export type StakingType = {
  name: string
  pid: number
  token: Token
  provideLink?: string
}

export type vDeusStakingType = {
  id: number
  name: string
  pid: number
  apr: number
  lockDuration: number
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

export const vDeusStakingPools: vDeusStakingType[] = [
  {
    id: 0,
    name: '3 Months',
    pid: 0,
    apr: 20,
    lockDuration: 180,
    provideLink: '/redeem',
  },
  {
    id: 1,
    name: '6 Months',
    pid: 1,
    apr: 40,
    lockDuration: 360,
    provideLink: '/redeem',
  },
  {
    id: 2,
    name: '1 Year',
    pid: 2,
    apr: 80,
    lockDuration: 720,
    provideLink: '/redeem',
  },
]
