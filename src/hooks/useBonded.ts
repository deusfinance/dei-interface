import { useMemo } from 'react'
import { useSingleContractMultipleMethods } from 'state/multicall/hooks'
import { useSupportedChainId } from 'hooks/useSupportedChainId'
import { useBondsContract } from 'hooks/useContract'
import { toBN } from 'utils/numbers'

export default function useBonded(bondsId: number[], deusPrice: number) {
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
            ...bondsId.map((id) => ({
              methodName: 'claimableDeus',
              callInputs: [id, toBN(deusPrice).toFixed()],
            })),
          ],
    [isSupportedChainId, bondsId, deusPrice]
  )

  const [APY, ...claimableDeus] = useSingleContractMultipleMethods(bondsContract, bondCalls)
  if (!APY.result || !claimableDeus.length) return { APY: 0, rewards: [] }

  const apyValue = APY.result.apyValue
  const rewards = claimableDeus.map((reward) => {
    if (reward && reward.result && reward.result.length) {
      const deusAmount = reward.result[0]
      return toBN(deusAmount.toString()).div(1e18).toNumber()
    }
    return 0
  })

  return { APY: toBN(apyValue.toString()).div(1e16).toNumber(), rewards }
}
