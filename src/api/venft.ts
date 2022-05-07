import { VenftItem } from './types'

export async function getVenftItems(): Promise<VenftItem[]> {
  return [
    {
      tokenId: 14278,
      needsAmount: 2000000000000,
      endTime: 1776900400,
    },
    {
      tokenId: 52823,
      needsAmount: 1000000000000,
      endTime: 1776902400,
    },
    {
      tokenId: 54278,
      needsAmount: 2000000000000,
      endTime: 1776900400,
    },
  ]
}
