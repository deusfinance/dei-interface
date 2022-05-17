import { useMemo } from 'react'
import { useSingleContractMultipleMethods } from 'state/multicall/hooks'
import { useSupportedChainId } from 'hooks/useSupportedChainId'
import { useBondsContract } from 'hooks/useContract'
import { toBN } from 'utils/numbers'

export default function useBonded(bondsId: number[], deusPrices: number[]) {
  const isSupportedChainId = useSupportedChainId()
  const bondsContract = useBondsContract()

  const firstCall = useMemo(
    () =>
      !isSupportedChainId
        ? []
        : [
            {
              methodName: 'getApy',
              callInputs: [],
            },
          ],
    [isSupportedChainId]
  )
  const secondCall = useMemo(() => {
    if (!isSupportedChainId) return []

    const calls = []
    for (let index = 0; index < bondsId.length; index++) {
      calls.push({
        methodName: 'claimableDeus',
        callInputs: [bondsId[index], deusPrices[index]],
      })
    }

    return calls
  }, [isSupportedChainId, bondsId, deusPrices])

  const [APY, ...deusAmounts] = useSingleContractMultipleMethods(bondsContract, [...firstCall, ...secondCall])
  if (!APY.result || !deusAmounts.length) return { APY: 0, amounts: [] }

  const [apyValue] = APY.result
  const amounts = []
  for (let index = 0; index < deusAmounts.length; index++) {
    const [deusAmount] = deusAmounts[index].result || []
    amounts.push(toBN(deusAmount.toString()).toNumber())
  }

  return { APY: toBN(apyValue.toString()).div(1e18).toNumber(), amounts }
}
