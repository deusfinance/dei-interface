import { useMemo } from 'react'
import { useSingleContractMultipleMethods } from 'state/multicall/hooks'
import { useSupportedChainId } from 'hooks/useSupportedChainId'
import { useBondsContract, useBondsOracleContract } from 'hooks/useContract'
import { toBN } from 'utils/numbers'
import { BondType } from 'hooks/useOwnedBonds'

export default function useBonded(bonds: BondType[], deusPrice: number) {
  const isSupportedChainId = useSupportedChainId()
  const bondsContract = useBondsContract()
  const bondIds = bonds.map((bond) => bond.id)
  const bondCalls = useMemo(
    () =>
      !isSupportedChainId
        ? []
        : bondIds.map((id) => ({
            methodName: 'claimableDeus',
            callInputs: [id, toBN(deusPrice).toFixed()],
          })),
    [isSupportedChainId, bondIds, deusPrice]
  )

  const claimableDeus = useSingleContractMultipleMethods(bondsContract, bondCalls)
  if (!claimableDeus.length) return { rewards: [] }

  const rewards = claimableDeus.map((reward) => {
    if (reward && reward.result && reward.result.length) {
      const deusAmount = reward.result[0]
      return toBN(deusAmount.toString()).div(1e18).toNumber()
    }
    return 0
  })

  return { rewards }
}

export function useBondsData(): { apy: number; paused: boolean; capacity: number } {
  const isSupportedChainId = useSupportedChainId()
  const bondsContract = useBondsContract()
  const bondCalls = useMemo(
    () =>
      !isSupportedChainId
        ? []
        : [
            {
              methodName: 'getApy',
              callInputs: [],
            },
            {
              methodName: 'paused',
              callInputs: [],
            },
            {
              methodName: 'capacity',
              callInputs: [],
            },
          ],
    [isSupportedChainId]
  )

  const [apy, paused, capacity] = useSingleContractMultipleMethods(bondsContract, bondCalls)

  return useMemo(() => {
    return {
      apy: apy?.result?.apyValue ? toBN(apy?.result?.apyValue.toString()).div(1e16).toNumber() : 0,
      capacity: capacity?.result?.capacity ? toBN(capacity?.result?.capacity.toString()).div(1e18).toNumber() : 0,
      paused: paused?.result?.paused ? true : false,
    }
  }, [apy, capacity, paused])
}

export function useBondsOracle() {
  const isSupportedChainId = useSupportedChainId()
  const bondsOracleContract = useBondsOracleContract()

  const oracleCalls = useMemo(
    () =>
      !isSupportedChainId
        ? []
        : [
            {
              methodName: 'getPrice',
              callInputs: [],
            },
            {
              methodName: 'lastPriceUpdate',
              callInputs: [],
            },
            {
              methodName: 'minimumRequiredSignatures',
              callInputs: [],
            },
          ],
    [isSupportedChainId]
  )

  const [deusPrice, lastPriceUpdate] = useSingleContractMultipleMethods(bondsOracleContract, oracleCalls)

  return useMemo(() => {
    if (!deusPrice || !deusPrice?.result?.length) return { deusPrice: 0, lastPriceUpdate: 0 }
    return {
      deusPrice: deusPrice.result ? toBN(deusPrice.result[0].toString()).toNumber() : 0,
      lastPriceUpdate: lastPriceUpdate.result ? toBN(lastPriceUpdate.result[0].toString()).toNumber() : 0,
    }
  }, [deusPrice, lastPriceUpdate])
}
