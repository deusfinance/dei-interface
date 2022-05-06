import { useVaultContract, useVeNFTContract } from 'hooks/useContract'
import useActiveWeb3React from 'hooks/useWeb3'
import { useMemo } from 'react'
import { useSingleContractMultipleData, useSingleContractMultipleMethods } from 'state/multicall/hooks'
import { fromWei } from 'utils/numbers'
import { BigNumber } from '@ethersproject/bignumber'
import { BigNumber as BigNumberJs } from 'bignumber.js'

export type AccountVenftToken = {
  tokenId: BigNumber
  needsAmount: BigNumberJs
  endTime: BigNumber
}

export function useVeNFTTokens() {
  const veNFTContract = useVeNFTContract()
  const { account } = useActiveWeb3React()

  const balanceCall = useMemo(() => {
    if (!account) return []
    return [{ methodName: 'balanceOf', callInputs: [account] }]
  }, [account])

  const [veNFTBalanceResult] = useSingleContractMultipleMethods(veNFTContract, balanceCall)
  const veNFTBalance = veNFTBalanceResult?.result?.[0]

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
        needsAmount: fromWei(result.amount.toString()),
        endTime: result.end,
      })
      return acc
    }, [])
  }, [veNFTTokenIds, result])
  return { veNFTBalance, veNFTTokens, veNFTTokenIds }
}

export function useFSolidWithdrawData() {
  const vaultContract = useVaultContract()
  const { account, chainId } = useActiveWeb3React()
  const vaultCalls = useMemo(() => {
    if (!account) return []
    return [
      { methodName: 'withdrawPendingId', callInputs: [account] },
      { methodName: 'ownerToId', callInputs: [account] },
      { methodName: 'lockPendingId', callInputs: [account] },
    ]
  }, [account])

  const [userWithdrawPendingTokenId, userTokenId, useLockPendingTokenId] = useSingleContractMultipleMethods(
    vaultContract,
    vaultCalls
  )

  const getCollateralAmountCall = useMemo(() => {
    if (!userWithdrawPendingTokenId.result || !vaultCalls.length) return []
    return [{ methodName: 'getCollateralAmount', callInputs: [userWithdrawPendingTokenId.result[0]] }]
  }, [userWithdrawPendingTokenId, vaultCalls])
  const [withdrawCollateralAmount] = useSingleContractMultipleMethods(vaultContract, getCollateralAmountCall)
  return {
    tokenId: userWithdrawPendingTokenId?.result?.[0],
    collateralAmount: withdrawCollateralAmount?.result?.[0],
    userTokenId: userTokenId?.result?.[0],
    useLockPendingTokenId: useLockPendingTokenId?.result?.[0],
  }
}
