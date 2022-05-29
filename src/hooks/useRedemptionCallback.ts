import { useCallback, useMemo } from 'react'
import { Currency, CurrencyAmount, NativeCurrency, Token } from '@sushiswap/core-sdk'

import { useTransactionAdder } from 'state/transactions/hooks'
import useWeb3React from 'hooks/useWeb3'
import { useDynamicRedeemerContract } from 'hooks/useContract'
import { toHex } from 'utils/hex'
import { createTransactionCallback } from 'utils/web3'

export enum RedeemCallbackState {
  INVALID = 'INVALID',
  VALID = 'VALID',
}

export default function useRedemptionCallback(
  deiCurrency: Currency | undefined | null,
  usdcCurrency: Currency | undefined | null,
  deiAmount: CurrencyAmount<NativeCurrency | Token> | null | undefined,
  usdcAmount: CurrencyAmount<NativeCurrency | Token> | null | undefined,
  deusAmount: string | null | undefined
): {
  state: RedeemCallbackState
  callback: null | (() => Promise<string>)
  error: string | null
} {
  const { account, chainId, library } = useWeb3React()
  const addTransaction = useTransactionAdder()
  const dynamicRedeemer = useDynamicRedeemerContract()

  const constructCall = useCallback(() => {
    try {
      if (!account || !library || !dynamicRedeemer || !deiAmount) {
        throw new Error('Missing dependencies.')
      }

      const methodName = 'redeemDEI'
      const args = [toHex(deiAmount.quotient)]

      return {
        address: dynamicRedeemer.address,
        calldata: dynamicRedeemer.interface.encodeFunctionData(methodName, args) ?? '',
        value: 0,
      }
    } catch (error) {
      return {
        error,
      }
    }
  }, [account, library, dynamicRedeemer, deiAmount])

  return useMemo(() => {
    if (!account || !chainId || !library || !dynamicRedeemer || !usdcCurrency || !deiCurrency || !deiAmount) {
      return {
        state: RedeemCallbackState.INVALID,
        callback: null,
        error: 'Missing dependencies',
      }
    }
    if (!usdcAmount || !deusAmount || !deiAmount) {
      return {
        state: RedeemCallbackState.INVALID,
        callback: null,
        error: 'No amount provided',
      }
    }
    const methodName = 'Redeem'
    const summary = `Redeem ${deiAmount?.toSignificant()} DEI for ${usdcAmount?.toSignificant()} USDC & $${deusAmount} as vDEUS NFT`

    return {
      state: RedeemCallbackState.VALID,
      error: null,
      callback: () => createTransactionCallback(methodName, constructCall, addTransaction, account, library, summary),
    }
  }, [
    account,
    chainId,
    library,
    addTransaction,
    constructCall,
    dynamicRedeemer,
    usdcCurrency,
    deiCurrency,
    usdcAmount,
    deusAmount,
    deiAmount,
  ])
}
