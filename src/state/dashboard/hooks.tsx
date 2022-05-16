import { useMemo } from 'react'
import { useAppSelector, AppState } from 'state'

export const useDashboardState = () => {
  return useAppSelector((state: AppState) => state.dashboard)
}

export const useDeusMetrics = () => {
  const {
    deusPrice,
    deusMarketCap,
    deusTotalSupply,
    deusFullyDilutedValuation,
    deusEmissions,
    deusBurnedEvents,
    deusDexLiquidity,
    stakedDeusLiquidity,
    deiCirculationSupply,
  } = useDashboardState()
  return useMemo(() => {
    return {
      deusPrice,
      deusMarketCap,
      deusTotalSupply,
      deusFullyDilutedValuation,
      deusEmissions,
      deusBurnedEvents,
      deusDexLiquidity,
      stakedDeusLiquidity,
      deiCirculationSupply,
    }
  }, [
    deusPrice,
    deusMarketCap,
    deusTotalSupply,
    deusFullyDilutedValuation,
    deusEmissions,
    deusBurnedEvents,
    deusDexLiquidity,
    stakedDeusLiquidity,
    deiCirculationSupply,
  ])
}

export const useDeiMetrics = () => {
  const { deiMarketCap, deiTotalSupply, deiDexLiquidity, mintedDei, stakedDeiLiquidity, deiCirculationSupply } =
    useDashboardState()
  return useMemo(() => {
    return { deiMarketCap, deiTotalSupply, deiDexLiquidity, mintedDei, stakedDeiLiquidity, deiCirculationSupply }
  }, [deiMarketCap, deiTotalSupply, deiDexLiquidity, mintedDei, stakedDeiLiquidity, deiCirculationSupply])
}
