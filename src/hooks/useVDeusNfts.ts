import { useMemo } from 'react'
import { useOwnerVDeusNFT } from './useOwnerNfts'
import snapshot from 'constants/files/vdeus-snapshot.json'
import { toBN } from 'utils/numbers'

export type VDEUS_NFT = {
  tokenId: number
  value: number
}

export function useOwnedVDeusNfts(): VDEUS_NFT[] {
  const { tokenIds } = useOwnerVDeusNFT()
  const parsedSnapshot = snapshot as { [tokenId: string]: number }
  return useMemo(
    () =>
      tokenIds.map((tokenId: number) => {
        const value = toBN(parsedSnapshot[tokenId.toString()] ?? 0)
          .div(1e18)
          .div(250)
          .toNumber()
        return { tokenId, value } as VDEUS_NFT
      }),
    [tokenIds, parsedSnapshot]
  )
}
