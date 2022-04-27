import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Percent, Token } from '@sushiswap/core-sdk'
import { makeHttpRequest } from 'utils/http'

export enum TypedField {
  COLLATERAL,
  BORROW,
}

export enum BorrowAction {
  BORROW = 'borrow',
  REPAY = 'repay',
}

export enum LenderVersion {
  V1 = 'v1',
  V2 = 'v2',
  V3 = 'v3', //real general lender
}

export enum HealthType {
  DEFAULT = '',
  SAFE = 'safe',
  MEDIUM = 'medium',
  RISKY = 'risky',
  HIGH_RISK = 'high risk',
}

export enum CollateralType {
  SOLIDEX = 'Solidex LP Token',
  OXDAO = '0xDAO LP Token',
}

export type OraclePairs = {
  pairs0: string[] | null
  pairs1: string[] | null
}

export interface PendingBorrowPool {
  contract: Token
  dei: Token
  token0: Token
  token1: Token
  version: LenderVersion
  composition: string
  oracle?: string
  generalLender?: string
  lpPool?: string
  type: CollateralType
}
export interface UnserializedBorrowPool {
  id?: number
  contract: Token
  dei: Token
  token0: Token
  token1: Token
  version: LenderVersion
  composition: string
  oracle?: string
  generalLender: string
  lpPool: string
  type: CollateralType
  liquidationFee: number
  mintHelper: string
}

export interface BorrowPool extends Omit<UnserializedBorrowPool, 'liquidationFee'> {
  liquidationFee: Percent
}

export interface BorrowState {
  typedValue: string
  typedField: TypedField
  attemptingTxn: boolean
  showReview: boolean
  error?: string
  pools: UnserializedBorrowPool[]
  pendingPools: any
}

const initialState: BorrowState = {
  typedValue: '',
  typedField: TypedField.COLLATERAL,
  attemptingTxn: false,
  showReview: false,
  error: undefined,
  pools: [],
  pendingPools: [],
}

export const fetch0xDaoPools = createAsyncThunk('borrow/fetch0xDao', async () => {
  const { href: url } = new URL('https://api.oxdao.fi/pools')
  const currentBlocks = await makeHttpRequest(url)
  return currentBlocks
})

export const borrowSlice = createSlice({
  name: 'borrow',
  initialState,
  reducers: {
    setBorrowState: (state, action: PayloadAction<BorrowState>) => {
      state.typedValue = action.payload.typedValue
      state.typedField = action.payload.typedField
      state.attemptingTxn = action.payload.attemptingTxn
      state.showReview = action.payload.showReview
      state.error = action.payload.error
    },
    setPools: (state, action: PayloadAction<UnserializedBorrowPool[]>) => {
      state.pools = action.payload
    },
    setAttemptingTxn: (state, action: PayloadAction<boolean>) => {
      state.attemptingTxn = action.payload
    },
    setShowReview: (state, action: PayloadAction<boolean>) => {
      state.showReview = action.payload
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetch0xDaoPools.pending, () => {
        console.log('Unable to fetch current blocks')
      })
      .addCase(fetch0xDaoPools.fulfilled, (state, { payload }) => {
        state.pendingPools = payload
      })
      .addCase(fetch0xDaoPools.rejected, () => {
        console.log('Unable to fetch pools')
      })
  },
})

export const { setBorrowState, setAttemptingTxn, setShowReview, setPools, setError } = borrowSlice.actions
export default borrowSlice.reducer
