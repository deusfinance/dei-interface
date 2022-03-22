import { useMemo } from 'react'
import { formatUnits } from '@ethersproject/units'

import { useSingleContractMultipleMethods } from 'state/multicall/hooks'
import { useVeDeusContract } from './useContract'
import { useSupportedChainId } from './useSupportedChainId'
import useWeb3React from './useWeb3'
import dayjs from 'dayjs'

export function useUserLocked(nftId: number): {
  deusAmount: string
  veDEUSAmount: string
  lockEnd: Date
} {
  const { account, chainId } = useWeb3React()
  const isSupportedChainId = useSupportedChainId()
  const veDEUSContract = useVeDeusContract()

  const calls = useMemo(
    () =>
      !account || !chainId || !isSupportedChainId
        ? []
        : [
            {
              methodName: 'balanceOfNFT',
              callInputs: [nftId],
            },
            {
              methodName: 'locked',
              callInputs: [nftId],
            },
          ],
    [account, chainId, isSupportedChainId, nftId]
  )

  const [balanceResult, lockedResult] = useSingleContractMultipleMethods(veDEUSContract, calls)
  return useMemo(
    () => ({
      deusAmount: calls.length && lockedResult.result ? formatUnits(lockedResult.result[0], 18) : '0',
      veDEUSAmount: calls.length && balanceResult.result ? formatUnits(balanceResult.result[0], 18) : '0',
      lockEnd:
        calls.length && lockedResult.result
          ? dayjs.unix(Number(formatUnits(lockedResult.result[1], 0))).toDate()
          : new Date(),
    }),
    [calls, balanceResult, lockedResult]
  )
}
