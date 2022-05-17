// use apy (decimal)
// array of id => res : array of result

import { useMemo } from 'react'
import { useSingleContractMultipleMethods } from 'state/multicall/hooks'
import { useSupportedChainId } from 'hooks/useSupportedChainId'
import { useBondsContract } from 'hooks/useContract'

// export default function useBonded(bondIds: number[], deusPrices: number[]) {
export default function useBonded() {
  const isSupportedChainId = useSupportedChainId()
  const ids = []
  // TODO
  const bondsContract = useBondsContract()
  const calls = useMemo(
    () =>
      !isSupportedChainId
        ? []
        : [
            {
              methodName: 'getAPY',
              callInputs: [],
            },
          ],
    [isSupportedChainId]
  )

  const [APY, res] = useSingleContractMultipleMethods(bondsContract, calls)
  console.log('use bonded: ', { APY, res })

  if (!APY || !res) return { APY: 0 }

  return { APY: 0 }
}
