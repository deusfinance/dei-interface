import { useVeNFTContract } from 'hooks/useContract'
import useActiveWeb3React from 'hooks/useWeb3'
import { BigNumber } from '@ethersproject/bignumber'
import { useEffect, useMemo, useState } from 'react'
import { useSingleContractMultipleData } from 'state/multicall/hooks'

export type AccountVenftItem = {
  tokenId: BigNumber
  needsAmount: BigNumber
  endTime: BigNumber
}

export function useVenftTokens(): AccountVenftItem[] {
  const veNFTContract = useVeNFTContract()
  const { account } = useActiveWeb3React()
  const [balance, setBalance] = useState<BigNumber | null>(null)
  useEffect(() => {
    let mounted = true
    const fun = async () => {
      if (!veNFTContract || !account) return
      const balance: BigNumber = await veNFTContract.balanceOf(account)
      if (mounted) {
        setBalance(balance)
      }
    }
    fun()
    return () => {
      mounted = false
    }
  }, [])

  const balances: number[] = balance ? Array.from(Array(balance.toNumber()).keys()) : []
  const getTokenIdsCallInputs = account ? balances.map((id) => [account, id]) : []
  const getTokenIdsResult = useSingleContractMultipleData(veNFTContract, 'tokenOfOwnerByIndex', getTokenIdsCallInputs)

  const tokenIds = useMemo(() => {
    return getTokenIdsResult
      .reduce((acc: BigNumber[], value) => {
        const result = value.result
        if (!result) return acc
        acc.push(value.result[0])
        return acc
      }, [])
      .sort((a: BigNumber, b: BigNumber) => (a > b ? 1 : -1))
  }, [getTokenIdsResult])

  const callInputs = tokenIds.map((id) => [id])
  const result = useSingleContractMultipleData(veNFTContract, 'locked', callInputs)

  const tokens = useMemo(() => {
    return result.reduce((acc: AccountVenftItem[], value, index) => {
      const result = value.result
      if (!result) return acc
      acc.push({
        tokenId: tokenIds[index],
        needsAmount: result.amount,
        endTime: result.end,
      })
      return acc
    }, [])
  }, [tokenIds, result])
  return tokens
}
