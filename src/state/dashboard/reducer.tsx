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
  deusPrice: 0,
  deusMarketCap: 0,
  deusTotalSupply: 0,
  deusFullyDilutedValuation: 0,
  deusEmissions: 0,
  deusBurnedEvents: 0,
  deusDexLiquidity: 0,
  deiMarketCap: 0,
  deiTotalSupply: 0,
  stakedDeusLiquidity: 0,
  deiDexLiquidity: 0,
  mintedDei: 0,
  stakedDeiLiquidity: 0,
  deiCirculatingSupply: 0,
}

// {
//   "deiCirculatingSupply": "62692811766742567526381580",
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

  const {
    deus_price,
    deus_marketcap,
    deus_total_supply,
    deus_fully_diluted_valuation,
    deus_emissions,
    deus_burned_events,
    deus_dex_liquidity,
    dei_marketcap,
    dei_total_supply,
    staked_deus_liquidity,
    dei_dex_liquidity,
    minted_dei,
    staked_dei_liquidity,
    dei_circulation_supply,
  } = await makeHttpRequest(url)
  return {
    deusPrice: deus_price,
    deusMarketCap: new BN(deus_marketcap).div(1e18).toNumber(),
    deusTotalSupply: new BN(deus_total_supply).div(1e18).toNumber(),
    deusFullyDilutedValuation: new BN(deus_fully_diluted_valuation).div(1e18).toNumber(),
    deusEmissions: new BN(deus_emissions).div(1e18).toNumber(),
    deusBurnedEvents: new BN(deus_burned_events).div(1e18).toNumber(),
    deusDexLiquidity: new BN(deus_dex_liquidity).div(1e18).toNumber(),
    deiMarketCap: new BN(dei_marketcap).div(1e18).toNumber(),
    deiTotalSupply: new BN(dei_total_supply).div(1e18).toNumber(),
    stakedDeusLiquidity: new BN(staked_deus_liquidity).div(1e18).toNumber(),
    deiDexLiquidity: new BN(dei_dex_liquidity).div(1e18).toNumber(),
    mintedDei: new BN(minted_dei).div(1e18).toNumber(),
    stakedDeiLiquidity: new BN(staked_dei_liquidity).div(1e18).toNumber(),
    deiCirculatingSupply: new BN(dei_circulation_supply).div(1e18).toNumber(),
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
        state.deusPrice = payload.deusPrice
        state.deusMarketCap = payload.deusMarketCap
        state.deusTotalSupply = payload.deusTotalSupply
        state.deusFullyDilutedValuation = payload.deusFullyDilutedValuation
        state.deusEmissions = payload.deusEmissions
        state.deusBurnedEvents = payload.deusBurnedEvents
        state.deusDexLiquidity = payload.deusDexLiquidity
        state.deiTotalSupply = payload.deiTotalSupply
        state.deiMarketCap = payload.deiMarketCap
        state.stakedDeusLiquidity = payload.stakedDeusLiquidity
        state.deiDexLiquidity = payload.deiDexLiquidity
        state.mintedDei = payload.mintedDei
        state.stakedDeiLiquidity = payload.stakedDeiLiquidity
        state.deiCirculatingSupply = payload.deiCirculatingSupply
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
