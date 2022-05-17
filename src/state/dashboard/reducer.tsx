import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import BN from 'bignumber.js'

import { INFO_URL } from 'constants/keys'
import { makeHttpRequest } from 'utils/http'

export enum DashboardStatus {
  OK = 'OK',
  LOADING = 'LOADING',
  ERROR = 'ERROR',
}

const initialState = {
  status: DashboardStatus.LOADING,
  deiMarketCap: 0,
  deiCirculatingSupply: 0,
  deiTotalSupply: 0,
}

// {
//   "dei_circulating_supply": "62692811766742567526381580",
//   "dei_dex_liquidity": "68340766294325897191884246",
//   "dei_marketcap": "62692811766742567526381580",
//   "dei_total_supply": "63094105660483139128030432",
//   "deus_burned_events": "140405355137408901110802",
//   "deus_circulating_supply": "140000000000000000000000",
//   "deus_dex_liquidity": "7878800016776363583209472",
//   "deus_emissions": "4178046000000000000000",
//   "deus_fully_diluted_valuation": "110642804869283439804678144",
//   "deus_marketcap": "61088751733961077337096192",
//   "deus_price": "436.34822667115054",
//   "deus_total_supply": "253615915530866742142173",
//   "minted_dei": "516475430496577315553310",
//   "staked_dei_liquidity": "17423397118903798768336896",
//   "staked_deus_liquidity": "7083165697173103241592832"
// }

export const fetchData = createAsyncThunk<any>('dashboard/fetchData', async () => {
  // Destruct the response directly so if these params don't exist it will throw an error.
  const { href: url } = new URL(`/info/info`, INFO_URL)

  const { dei_marketcap, dei_circulating_supply, dei_total_supply } = await makeHttpRequest(url)

  return {
    deiMarketCap: new BN(dei_marketcap).div(1e18).toNumber(),
    deiCirculatingSupply: new BN(dei_circulating_supply).div(1e18).toNumber(),
    deiTotalSupply: new BN(dei_total_supply).div(1e18).toNumber(),
  }
})

const deiSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    updateStatus: (state, { payload }) => {
      state.status = payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchData.pending, (state) => {
        state.status = DashboardStatus.LOADING
      })
      .addCase(fetchData.fulfilled, (state, { payload }) => {
        state.status = DashboardStatus.OK
        state.deiMarketCap = payload.deiMarketCap
        state.deiCirculatingSupply = payload.deiCirculatingSupply
        state.deiTotalSupply = payload.deiTotalSupply
      })
      .addCase(fetchData.rejected, () => {
        console.log('Unable to fetch dashboard info')
        return {
          ...initialState,
          status: DashboardStatus.ERROR,
        }
      })
  },
})

const { actions, reducer } = deiSlice
export const { updateStatus } = actions
export default reducer
