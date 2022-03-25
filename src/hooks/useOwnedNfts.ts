import { useMemo } from 'react'
import useWeb3React from 'hooks/useWeb3'
import { useSupportedChainId } from 'hooks/useSupportedChainId'
import { useSingleContractMultipleData } from 'state/multicall/hooks'
import { useVeDeusContract } from 'hooks/useContract'

const idMapping = Array.from(Array(1000).keys())

export default function useOwnedNfts(): number[] {
  const { account, chainId } = useWeb3React()
  const isSupportedChainId = useSupportedChainId()
  const veDEUSContract = useVeDeusContract()

  const callInputs = useMemo(() => {
    return !chainId || !isSupportedChainId || !account ? [] : idMapping.map((id) => [account, id])
  }, [account, chainId, isSupportedChainId])

  const results = useSingleContractMultipleData(veDEUSContract, 'tokenOfOwnerByIndex', callInputs)

  return useMemo(() => {
    return results
      .reduce((acc: number[], value) => {
        if (!value.result) return acc
        const result = value.result[0].toString()
        if (!result || result == 0) return acc
        acc.push(parseInt(result))
        return acc
      }, [])
      .sort((a: number, b: number) => (a > b ? 1 : -1))
  }, [results])
}
