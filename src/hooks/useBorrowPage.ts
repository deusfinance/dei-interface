import { useMemo } from 'react'
import { Currency, ZERO } from '@sushiswap/core-sdk'

import useWeb3React from './useWeb3'
import { TypedField, BorrowAction } from 'state/borrow/reducer'
import { useBorrowState } from 'state/borrow/hooks'
import { useCurrencyBalance } from 'state/wallet/hooks'

import { maxAmountSpend } from 'utils/currency'
import { tryParseAmount } from 'utils/parse'

export enum UserError {
  ACCOUNT = 'ACCOUNT',
  BALANCE = 'BALANCE',
  AMOUNT = 'AMOUNT',
  VALID = 'VALID',
}

export default function useBorrowPage(
  collateralCurrency: Currency | undefined,
  pairCurrency: Currency | undefined,
  action: BorrowAction
) {
  const { chainId, account } = useWeb3React()
  const { typedValue, typedField } = useBorrowState()
  const collateralBalance = useCurrencyBalance(account ?? undefined, collateralCurrency)
  const pairBalance = useCurrencyBalance(account ?? undefined, pairCurrency)

  // Amount typed in either input or output fields
  const typedAmount = useMemo(() => {
    return tryParseAmount(typedValue, typedField === TypedField.A ? collateralCurrency : pairCurrency)
  }, [collateralCurrency, pairCurrency, typedValue, typedField])

  // Computed counter amount by typedAmount and its corresponding price
  const computedAmount = useMemo(() => {
    if (!typedAmount) return undefined

    // inputfield
    if (typedField === TypedField.A && action === BorrowAction.BORROW) {
      return typedAmount
    }
    if (typedField === TypedField.A && action === BorrowAction.REPAY) {
      return typedAmount
    }

    // outputfield
    if (action === BorrowAction.BORROW) {
      return typedAmount
    }
    return typedAmount
  }, [typedAmount, typedField, action])

  const parsedAmounts = useMemo(() => {
    return [
      typedField === TypedField.A ? typedAmount : computedAmount,
      typedField === TypedField.A ? computedAmount : typedAmount,
    ]
  }, [typedField, typedAmount, computedAmount])

  // Stringified values purely for user display
  const formattedAmounts = useMemo(() => {
    return [
      typedField === TypedField.A ? typedValue : computedAmount?.toSignificant(9) ?? '',
      typedField === TypedField.B ? typedValue : computedAmount?.toSignificant(9) ?? '',
    ]
  }, [typedField, typedValue, computedAmount])

  const balanceError = useMemo(() => {
    if (action === BorrowAction.BORROW) {
      return collateralBalance && parsedAmounts[0] && maxAmountSpend(collateralBalance)?.lessThan(parsedAmounts[0])
    }
    return pairBalance && parsedAmounts[1] && maxAmountSpend(pairBalance)?.lessThan(parsedAmounts[1])
  }, [collateralBalance, pairBalance, parsedAmounts, action])

  const error = useMemo(
    () =>
      !account || !chainId
        ? UserError.ACCOUNT
        : parsedAmounts[0]?.equalTo(ZERO)
        ? UserError.AMOUNT
        : balanceError
        ? UserError.BALANCE
        : UserError.VALID,
    [account, chainId, balanceError, parsedAmounts]
  )

  return useMemo(
    () => ({
      error,
      formattedAmounts,
      parsedAmounts,
    }),
    [error, formattedAmounts, parsedAmounts]
  )
}
