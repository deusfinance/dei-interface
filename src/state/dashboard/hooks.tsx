import { useMemo } from 'react'
import { useAppSelector, AppState } from 'state'

export const useDashboardState = () => {
  return useAppSelector((state: AppState) => state.dashboard)
}

export const useDeusMetrics = () => {
  const { deiMarketCap, deiCirculatingSupply, deiTotalSupply } = useDashboardState()
  return useMemo(() => {
    return {
      deiMarketCap,
      deiCirculatingSupply,
      deiTotalSupply,
    }
  }, [deiMarketCap, deiCirculatingSupply, deiTotalSupply])
}

export const useDeiMetrics = () => {
  const { deiMarketCap, deiCirculatingSupply, deiTotalSupply } = useDashboardState()
  return useMemo(() => {
    return { deiMarketCap, deiCirculatingSupply, deiTotalSupply }
  }, [deiMarketCap, deiCirculatingSupply, deiTotalSupply])
}
