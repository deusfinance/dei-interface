import { useMemo } from 'react'
import { formatUnits } from '@ethersproject/units'
import { CurrencyAmount, Token } from '@sushiswap/core-sdk'

import { useSingleContractMultipleMethods } from 'state/multicall/hooks'
import { toBN } from 'utils/numbers'
import { toHex } from 'utils/hex'
import { useDeiBonderContract } from 'hooks/useContract'

export type RedeemTranche = {
  trancheId: number | null
  USDRatio: number
  deusRatio: number
  amountRemaining: number
  endTime: number
}

export function useRedeemData(amountIn: CurrencyAmount<Token>): {
  redeemTime: number
  deiBonded: number
  bondingPaused: boolean
} {
  const contract = useDeiBonderContract()
  const currentTrancheCall = [
    {
      methodName: 'getRedeemTime',
      callInputs: [toHex(amountIn.quotient)],
    },
    {
      methodName: 'bondingPaused',
      callInputs: [],
    },
    {
      methodName: 'deiBonded',
      callInputs: [],
    },
  ]
  const [redeemTime, bondingPaused, deiBonded] = useSingleContractMultipleMethods(contract, currentTrancheCall)

  const { redeemTimeValue, bondingPausedValue, deiBondedValue } = useMemo(
    () => ({
      redeemTimeValue: redeemTime?.result ? Number(redeemTime.result[0].toString()) : 0,
      bondingPausedValue: bondingPaused?.result ? bondingPaused?.result[0] : false,
      deiBondedValue: deiBonded?.result ? toBN(formatUnits(deiBonded.result[0], 18)).toNumber() : 0,
    }),
    [redeemTime, bondingPaused, deiBonded]
  )

  return {
    redeemTime: redeemTimeValue,
    bondingPaused: bondingPausedValue,
    deiBonded: deiBondedValue,
  }
}

export function useBondsAmountsOut(amountIn: string): {
  amountOut: string
} {
  const amountOut = amountIn
  return {
    amountOut,
  }
}
