import { useCallback, useMemo } from 'react'
import { Currency, CurrencyAmount, NativeCurrency, Token, ZERO } from '@sushiswap/core-sdk'
import BigNumber from 'bignumber.js'
import { BorrowClient } from 'lib/muon'

import { useTransactionAdder } from 'state/transactions/hooks'
import { BorrowAction, BorrowPool, LenderVersion, TypedField } from 'state/borrow/reducer'
import { useUserPoolData } from 'hooks/usePoolData'
import useWeb3React from 'hooks/useWeb3'
import { useGeneralLenderContract } from 'hooks/useContract'
import { createTransactionCallback } from 'utils/web3'
import { toHex } from 'utils/hex'

export enum BorrowCallbackState {
  INVALID = 'INVALID',
  VALID = 'VALID',
}

export default function useBorrowCallback(
  collateralCurrency: Currency | undefined,
  borrowCurrency: Currency | undefined,
  collateralAmount: CurrencyAmount<NativeCurrency | Token> | null | undefined,
  borrowAmount: CurrencyAmount<NativeCurrency | Token> | null | undefined,
  pool: BorrowPool,
  action: BorrowAction,
  typedField: TypedField,
  payOff: boolean | null
): {
  state: BorrowCallbackState
  callback: null | (() => Promise<string>)
  error: string | null
} {
  const { chainId, account, library } = useWeb3React()
  const addTransaction = useTransactionAdder()
  const GeneralLender = useGeneralLenderContract(pool)
  const { userBorrow } = useUserPoolData(pool)

  const getOracleData = useCallback(async () => {
    const result = await BorrowClient.getCollateralPrice(pool)
    if (result.success === false) {
      throw new Error(`Unable to fetch Muon collateral price: ${result.error}`)
    }
    return result.data.calldata
  }, [pool])

  const constructCall = useCallback(async () => {
    try {
      if (!account || !chainId || !library || !GeneralLender || !collateralCurrency || !borrowCurrency) {
        throw new Error('Missing dependencies.')
      }

      let args = []
      let methodName

      if (action === BorrowAction.BORROW && typedField === TypedField.COLLATERAL) {
        if (!collateralAmount) throw new Error('Missing collateralAmount.')
        args = [account, toHex(collateralAmount.quotient)]
        methodName = 'addCollateral'
      } else if (action === BorrowAction.REPAY && typedField === TypedField.COLLATERAL) {
        if (!collateralAmount) throw new Error('Missing collateralAmount.')
        args = [account, toHex(collateralAmount.quotient)]

        if (pool.version == LenderVersion.V2) {
          const { price, reqId, sigs, timestamp } = await getOracleData()
          if (!price || !reqId || !sigs || !timestamp) throw new Error('Missing dependencies from muon oracles.')
          args = [...args, price, timestamp, reqId, sigs]
        }
        methodName = 'removeCollateral'
      } else if (action === BorrowAction.BORROW && typedField === TypedField.BORROW) {
        if (!borrowAmount) throw new Error('Missing borrowAmount.')
        args = [account, toHex(borrowAmount.quotient)]

        if (pool.version == LenderVersion.V2) {
          const { price, reqId, sigs, timestamp } = await getOracleData()
          if (!price || !reqId || !sigs || !timestamp) throw new Error('Missing dependencies from muon oracles.')
          args = [...args, price, timestamp, reqId, sigs]
        }
        methodName = 'borrow'
      } else if (action === BorrowAction.REPAY && typedField === TypedField.BORROW && payOff) {
        if (!userBorrow) throw new Error('Missing userBorrow.')
        args = [account, new BigNumber(userBorrow).times(1e18).toFixed(0)]
        methodName = 'repayBase'
      } else {
        if (!borrowAmount) throw new Error('Missing borrowAmount.')
        args = [account, toHex(borrowAmount.quotient)]
        methodName = 'repayElastic'
      }

      return {
        address: GeneralLender.address,
        calldata: GeneralLender.interface.encodeFunctionData(methodName, args) ?? '',
        value: 0,
      }
    } catch (error) {
      return {
        error,
      }
    }
  }, [
    pool,
    chainId,
    account,
    library,
    GeneralLender,
    collateralCurrency,
    borrowCurrency,
    action,
    typedField,
    collateralAmount,
    borrowAmount,
    payOff,
    userBorrow,
    getOracleData,
  ])

  return useMemo(() => {
    if (!account || !chainId || !library || !GeneralLender || !collateralCurrency || !borrowCurrency) {
      return {
        state: BorrowCallbackState.INVALID,
        callback: null,
        error: 'Missing dependencies',
      }
    }
    if ((!collateralAmount || collateralAmount.equalTo(ZERO)) && (!borrowAmount || borrowAmount.equalTo(ZERO))) {
      return {
        state: BorrowCallbackState.INVALID,
        callback: null,
        error: 'No amount provided',
      }
    }

    const methodName = 'Borrow'
    const summary =
      action === BorrowAction.BORROW
        ? typedField === TypedField.COLLATERAL
          ? `Deposit ${collateralAmount?.toSignificant()} ${collateralCurrency.symbol}`
          : `Borrow ${borrowAmount?.toSignificant()} ${borrowCurrency.symbol}`
        : typedField === TypedField.COLLATERAL
        ? `Withdraw ${collateralAmount?.toSignificant()} ${collateralCurrency.symbol}`
        : `Repay ${borrowAmount?.toSignificant()} ${borrowCurrency.symbol}`

    return {
      state: BorrowCallbackState.VALID,
      error: null,
      callback: () => createTransactionCallback(methodName, constructCall, addTransaction, account, library, summary),
    }
  }, [
    account,
    chainId,
    library,
    addTransaction,
    constructCall,
    action,
    typedField,
    GeneralLender,
    collateralCurrency,
    borrowCurrency,
    collateralAmount,
    borrowAmount,
  ])
}
