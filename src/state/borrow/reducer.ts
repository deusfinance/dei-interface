import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Percent, Token } from '@sushiswap/core-sdk'

export enum TypedField {
  A,
  B,
}

export enum BorrowAction {
  BORROW = 'borrow',
  REPAY = 'repay',
}

export interface UnserializedBorrowPool {
  contract: string
  abi: any
  composition: string
  collateral: Token
  pair: Token
  ltv: number
  interestRate: number
  borrowFee: number
  liquidationFee: number
}

export interface BorrowPool extends Omit<UnserializedBorrowPool, 'interestRate' | 'borrowFee' | 'liquidationFee'> {
  interestRate: Percent
  borrowFee: Percent
  liquidationFee: Percent
}

export interface BorrowState {
  typedValue: string
  typedField: TypedField
  error?: string
  pools: UnserializedBorrowPool[]
}

const initialState: BorrowState = {
  typedValue: '',
  typedField: TypedField.A,
  error: undefined,
  pools: [],
}

export const borrowSlice = createSlice({
  name: 'borrow',
  initialState,
  reducers: {
    setUserState: (state, action: PayloadAction<BorrowState>) => {
      state.typedValue = action.payload.typedValue
      state.typedField = action.payload.typedField
      state.error = action.payload.error
    },
    setPools: (state, action: PayloadAction<UnserializedBorrowPool[]>) => {
      state.pools = action.payload
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
    },
  },
})

export const { setUserState, setPools, setError } = borrowSlice.actions
export default borrowSlice.reducer
