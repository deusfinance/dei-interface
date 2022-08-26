import { useMemo } from 'react'
import { Token } from '@sushiswap/core-sdk'
import { formatUnits } from '@ethersproject/units'

import { useSingleContractMultipleMethods } from 'state/multicall/hooks'
import { BN_TEN, toBN } from 'utils/numbers'
import { useVDeusSwapContract } from 'hooks/useContract'

export function useSwapAmountsOut(
  amountIn: string,
  tokenIn: Token
): {
  amountOut: string
} {
  const amountInBN = amountIn ? toBN(amountIn).times(BN_TEN.pow(tokenIn.decimals)).toFixed(0) : ''
  const contract = useVDeusSwapContract()
  const positions = useMemo(() => (tokenIn?.symbol === 'vDEUS' ? [1, 0] : [0, 1]), [tokenIn])

  const amountOutCall = useMemo(
    () =>
      !amountInBN || amountInBN == '' || amountInBN == '0'
        ? []
        : [
            {
              methodName: 'calculateSwap',
              callInputs: [...positions, amountInBN],
            },
          ],
    [amountInBN, positions]
  )

  const [bdeiSwap] = useSingleContractMultipleMethods(contract, amountOutCall)

  const amountOut = !bdeiSwap || !bdeiSwap.result ? '' : toBN(formatUnits(bdeiSwap.result[0].toString(), 18)).toString()

  return {
    amountOut,
  }
}
