import { useState, useCallback, useMemo } from 'react'
import { BigNumber } from 'bignumber.js'
import debounce from 'lodash/debounce'
import { toBN } from 'utils/numbers'
import { useDynamicRedeemerContract } from './useContract'
import { useSingleContractMultipleMethods } from 'state/multicall/hooks'
import { formatUnits } from '@ethersproject/units'

export type RedeemTranche = {
  trancheId: number | null
  USDRatio: number
  deusRatio: number
  amountRemaining: number
  endTime: number
}

export function useRedeemData(): { redeemTranche: RedeemTranche; redemptionFee: number; redeemPaused: boolean } {
  const contract = useDynamicRedeemerContract()
  const currentTrancheCall = [
    {
      methodName: 'currentTranche',
      callInputs: [],
    },
    {
      methodName: 'redeemPaused',
      callInputs: [],
    },
    {
      methodName: 'redemptionFee',
      callInputs: [],
    },
    {
      methodName: 'usdTokenDecimals',
      callInputs: [],
    },
  ]
  const [currentTranche, redeemPaused, redemptionFee, usdTokenDecimals] = useSingleContractMultipleMethods(
    contract,
    currentTrancheCall
  )

  //TODO
  const { currentTrancheValue, redeemPausedValue, redemptionFeeValue, usdTokenDecimalsValue } = useMemo(
    () => ({
      currentTrancheValue: currentTranche?.result ? Number(currentTranche.result[0].toString()) : null,
      redeemPausedValue: redeemPaused?.result ? redeemPaused?.result[0] : false,
      redemptionFeeValue: redemptionFee?.result ? toBN(formatUnits(redemptionFee.result[0], 6)).toNumber() : 0,
      usdTokenDecimalsValue: usdTokenDecimals?.result ? Number(usdTokenDecimals.result[0].toString()) : null,
    }),
    [currentTranche, redeemPaused, redemptionFee, usdTokenDecimals]
  )

  const trancheDetailsCall =
    currentTrancheValue != null
      ? [
          {
            methodName: 'tranches',
            callInputs: [currentTrancheValue],
          },
        ]
      : []

  const [result] = useSingleContractMultipleMethods(contract, trancheDetailsCall)

  const redeemTranche: RedeemTranche = useMemo(() => {
    if (!result || !result.result || !result.result?.length)
      return { trancheId: null, USDRatio: 0, deusRatio: 0, amountRemaining: 0, endTime: 0 }
    const data = result.result

    return {
      trancheId: currentTrancheValue,
      USDRatio: toBN(data.USDRatio.toString()).toNumber(),
      deusRatio: toBN(data.deusRatio.toString()).toNumber(),
      amountRemaining:
        usdTokenDecimalsValue != null ? toBN(formatUnits(data.amountRemaining, usdTokenDecimalsValue)).toNumber() : 0,
      endTime: toBN(data.endTime.toString()).times(1000).toNumber(),
    } as RedeemTranche
  }, [result, currentTrancheValue, usdTokenDecimalsValue])
  return { redeemTranche, redemptionFee: redemptionFeeValue, redeemPaused: redeemPausedValue }
}

export function useRedeemAmounts(): {
  amountIn: string
  amountOut1: string
  amountOut2: string
  onUserInput: (amount: string) => void
  onUserOutput1: (amount: string) => void
  onUserOutput2: (amount: string) => void
} {
  const { redeemTranche, redemptionFee: fee } = useRedeemData()

  const { trancheId, USDRatio, deusRatio } = redeemTranche
  const [amountIn, setAmountIn] = useState<string>('')
  const [amountOut1, setAmountOut1] = useState<string>('')
  const [amountOut2, setAmountOut2] = useState<string>('')

  const feeFactorBN: BigNumber = useMemo(() => {
    return toBN(1 - fee / 100)
  }, [fee])

  const debounceUserInput = useCallback(
    debounce((amount: string) => {
      if (amount === '' || trancheId == null) {
        setAmountOut1('')
        setAmountOut2('')
        return
      }
      //   if (deiStatus == DeiStatus.ERROR) {
      //     toast.error('Missing dependencies from oracle.')
      //     return
      //   }

      const inputAmount = toBN(amount)
      const outputAmount1 = inputAmount.times(USDRatio).times(feeFactorBN)
      const outputAmount2 = inputAmount.times(deusRatio).times(feeFactorBN)
      setAmountOut1(outputAmount1.toString())
      setAmountOut2(outputAmount2.toString())
    }, 300),
    [USDRatio, deusRatio, feeFactorBN, trancheId]
  )

  const debounceUserOutput1 = useCallback(
    debounce((amount: string) => {
      if (amount === '' || trancheId == null) {
        setAmountIn('')
        setAmountOut2('')
        return
      }

      const outputAmount1 = toBN(amount)
      const inputAmount = outputAmount1.div(USDRatio).div(feeFactorBN)
      const outputAmount2 = inputAmount.times(deusRatio).times(feeFactorBN)

      setAmountIn(inputAmount.toString())
      setAmountOut2(outputAmount2.toString())
    }, 300),
    [USDRatio, deusRatio, feeFactorBN, trancheId]
  )

  const debounceUserOutput2 = useCallback(
    debounce((amount: string) => {
      if (amount === '' || trancheId == null) {
        setAmountIn('')
        setAmountOut1('')
        return
      }

      const outputAmount2 = toBN(amount)
      const inputAmount = outputAmount2.div(deusRatio).div(feeFactorBN)
      const outputAmount1 = inputAmount.times(USDRatio).times(feeFactorBN)

      setAmountIn(inputAmount.toString())
      setAmountOut1(outputAmount1.toString())
    }, 300),
    [USDRatio, deusRatio, feeFactorBN, trancheId]
  )

  const onUserInput = (amount: string): void => {
    setAmountIn(amount)
    debounceUserInput(amount)
  }
  const onUserOutput1 = (amount: string): void => {
    setAmountOut1(amount)
    debounceUserOutput1(amount)
  }
  const onUserOutput2 = (amount: string): void => {
    setAmountOut2(amount)
    debounceUserOutput2(amount)
  }

  return {
    amountIn,
    amountOut1,
    amountOut2,
    onUserInput,
    onUserOutput1,
    onUserOutput2,
  }
}
