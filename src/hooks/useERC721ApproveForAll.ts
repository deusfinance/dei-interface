import { useState, useMemo } from 'react'

import { useSingleCallResult } from 'state/multicall/hooks'
import useWeb3React from 'hooks/useWeb3'
import { useContract } from 'hooks/useContract'
import VDEUS_ABI from 'constants/abi/VDEUS.json'

export function useERC721ApproveForAll(
  tokenAddress: string | null | undefined,
  spender: string | null | undefined
): boolean {
  const { account } = useWeb3React()
  const [cachedResult, setCachedResult] = useState(false)
  const ERC721Contract = useContract(tokenAddress, VDEUS_ABI)
  const inputs = useMemo(() => [account ?? undefined, spender ?? undefined], [account, spender])
  const approvedAll = useSingleCallResult(ERC721Contract, 'isApprovedForAll', inputs)

  return useMemo(() => {
    const loading = !tokenAddress || approvedAll.loading || !approvedAll.result || approvedAll.syncing
    if (loading) {
      return cachedResult
    }
    setCachedResult(approvedAll.result[0])
    return approvedAll.result[0]
  }, [tokenAddress, approvedAll, cachedResult])
}
