import { useMemo } from 'react'
import { useOwnerVDeusNFT } from './useOwnerNfts'

export type VDEUS_NFT = {
  tokenId: number
  value: number
}

export function useOwnedVDeusNfts(): VDEUS_NFT[] {
  const { tokenIds } = useOwnerVDeusNFT()
  return useMemo(() => tokenIds.map((tokenId: number) => ({ tokenId, value: 100 } as VDEUS_NFT)), [tokenIds])
}
export function useOwnedVDeusNfts2(): VDEUS_NFT[] {
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
