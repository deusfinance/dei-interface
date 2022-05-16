import { useMemo } from 'react'
import useWeb3React from 'hooks/useWeb3'
import { useSupportedChainId } from 'hooks/useSupportedChainId'
import { useSingleContractMultipleData } from 'state/multicall/hooks'
// TODO: change to useBondsContract
import { useVeDeusContract } from 'hooks/useContract'

const idMapping = Array.from(Array(1000).keys())

export type BondsType = {
    id:Number,
    amount: Number,
    start: Number,
    duration: Number
}

// TODO: check return type
export default function useOwnedBonds(): BondsType[] {
  const { account, chainId } = useWeb3React()
  const isSupportedChainId = useSupportedChainId()
    //  TODO
  const bondsContract

  const callInputs = useMemo(() => {
    return !chainId || !isSupportedChainId || !account ? [] : idMapping.map((id) => [account, id])
  }, [account, chainId, isSupportedChainId])

//   TODO
  const results = useSingleContractMultipleData(, '', callInputs)

//   TODO
  return useMemo(() => {
    return results
      .reduce((acc: number[], value) => {
        if (!value.result) return acc
        const result = value.result[0].toString()
        if (!result || result === '0') return acc
        acc.push(parseInt(result))
        return acc
      }, [])
      .sort((a: number, b: number) => (a > b ? 1 : -1))
  }, [results])
}
