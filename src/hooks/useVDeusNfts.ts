import { useMemo } from 'react'

export type VDEUS_NFT = {
  tokenId: number
  value: number
}

export function useOwnedVDeusNfts(): VDEUS_NFT[] {
  return useMemo(() => {
    return [
      { tokenId: 2, value: 31 },
      { tokenId: 3, value: 32 },
      { tokenId: 4, value: 33 },
      { tokenId: 5, value: 314 },
      { tokenId: 6, value: 315 },
    ]
  }, [])
}
