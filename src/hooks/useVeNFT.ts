import { useVeNFTContract } from 'hooks/useContract'
import useActiveWeb3React from 'hooks/useWeb3'
import { BigNumber } from '@ethersproject/bignumber'
import { useEffect, useMemo, useState } from 'react'
import { useSingleContractMultipleData } from 'state/multicall/hooks'

export type AccountVenftToken = {
  tokenId: BigNumber
  needsAmount: BigNumber
  endTime: BigNumber
}

export function useVeNFTTokens() {
  const veNFTContract = useVeNFTContract()
  const { account } = useActiveWeb3React()
  const [veNFTBalance, setVeNFTBalance] = useState<BigNumber | null>(null)
  useEffect(() => {
    let mounted = true
    const fun = async () => {
      if (!veNFTContract || !account) return
      const balance: BigNumber = await veNFTContract.balanceOf(account)
      if (mounted) {
        setVeNFTBalance(balance)
      }
    }
    fun()
    return () => {
      mounted = false
    }
  }, [account])

  const balances: number[] = veNFTBalance ? Array.from(Array(veNFTBalance.toNumber()).keys()) : []
  const getTokenIdsCallInputs = account ? balances.map((id) => [account, id]) : []
  const getTokenIdsResult = useSingleContractMultipleData(veNFTContract, 'tokenOfOwnerByIndex', getTokenIdsCallInputs)

  const veNFTTokenIds = useMemo(() => {
    return getTokenIdsResult
      .reduce((acc: BigNumber[], value) => {
        const result = value.result
        if (!result) return acc
        acc.push(value.result[0])
        return acc
      }, [])
      .sort((a: BigNumber, b: BigNumber) => (a > b ? 1 : -1))
  }, [getTokenIdsResult])

  const callInputs = veNFTTokenIds.map((id) => [id])
  const result = useSingleContractMultipleData(veNFTContract, 'locked', callInputs)

  const veNFTTokens = useMemo(() => {
    return result.reduce((acc: AccountVenftToken[], value, index) => {
      const result = value.result
      if (!result) return acc
      acc.push({
        tokenId: veNFTTokenIds[index],
        needsAmount: result.amount,
        endTime: result.end,
      })
      return acc
    }, [])
  }, [veNFTTokenIds, result])
  return { veNFTBalance, veNFTTokens, veNFTTokenIds }
}
