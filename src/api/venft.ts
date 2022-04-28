import { VenftItem } from './types'

export async function getVenftItems(): Promise<VenftItem[]> {
  return [
    {
      tokenId: 32824,
      needsAmount: 1000000000000,
      endTime: 1776902400,
    },
    {
      tokenId: 14278,
      needsAmount: 2000000000000,
      endTime: 1776902400,
    },
  ]
}
