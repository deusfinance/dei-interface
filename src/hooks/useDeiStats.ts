import { formatUnits } from '@ethersproject/units'
import { ProtocolHoldings1, ProtocolHoldings2, USDCReserves1, USDCReserves2 } from 'constants/addresses'
import { SupportedChainId } from 'constants/chains'
import { DEI_TOKEN, USDC_TOKEN } from 'constants/tokens'
import { useMemo } from 'react'
import { useSingleContractMultipleMethods } from 'state/multicall/hooks'
import { toBN } from 'utils/numbers'
import { useBonderData } from './useBondsPage'
import { useERC20Contract } from './useContract'

export function useDeiStats(): {
  totalSupply: number
  totalProtocolHoldings: number
  circulatingSupply: number
  totalUSDCReserves: number
} {
  const { deiBonded } = useBonderData()
  const deiContract = useERC20Contract(DEI_TOKEN.address)
  const usdcContract = useERC20Contract(USDC_TOKEN.address)
  const protocolHoldings1Address = ProtocolHoldings1[SupportedChainId.FANTOM]
  const protocolHoldings2Address = ProtocolHoldings2[SupportedChainId.FANTOM]
  const usdcReserves1 = USDCReserves1[SupportedChainId.FANTOM]
  const usdcReserves2 = USDCReserves2[SupportedChainId.FANTOM]

  const calls = !deiContract
    ? []
    : [
        {
          methodName: 'totalSupply',
          callInputs: [],
        },
        {
          methodName: 'balanceOf',
          callInputs: [protocolHoldings1Address],
        },
        {
          methodName: 'balanceOf',
          callInputs: [protocolHoldings2Address],
        },
      ]

  const [totalSupplyDEI, ph1DeiHoldings, ph2DeiHoldings] = useSingleContractMultipleMethods(deiContract, calls)

  const { totalSupplyDEIValue, totalProtocolHoldings } = useMemo(() => {
    return {
      totalSupplyDEIValue: totalSupplyDEI?.result ? toBN(formatUnits(totalSupplyDEI.result[0], 18)).toNumber() : 0,
      totalProtocolHoldings:
        (ph1DeiHoldings?.result ? toBN(formatUnits(ph1DeiHoldings.result[0], 18)).toNumber() : 0) +
        (ph2DeiHoldings?.result ? toBN(formatUnits(ph2DeiHoldings.result[0], 18)).toNumber() : 0),
    }
  }, [totalSupplyDEI, ph1DeiHoldings, ph2DeiHoldings])

  const circulatingSupply = useMemo(() => {
    return totalSupplyDEIValue - totalProtocolHoldings - deiBonded
  }, [totalSupplyDEIValue, totalProtocolHoldings, deiBonded])

  const reservesCalls = !usdcContract
    ? []
    : [
        {
          methodName: 'balanceOf',
          callInputs: [usdcReserves1],
        },
        {
          methodName: 'balanceOf',
          callInputs: [usdcReserves2],
        },
      ]

  const [usdcBalance1, usdcBalance2] = useSingleContractMultipleMethods(usdcContract, reservesCalls)

  const { totalUSDCReserves } = useMemo(() => {
    return {
      totalUSDCReserves:
        (usdcBalance1?.result ? toBN(formatUnits(usdcBalance1.result[0], 6)).toNumber() : 0) +
        (usdcBalance2?.result ? toBN(formatUnits(usdcBalance2.result[0], 6)).toNumber() : 0),
    }
  }, [usdcBalance1, usdcBalance2])

  return {
    totalSupply: totalSupplyDEIValue,
    totalProtocolHoldings,
    circulatingSupply,
    totalUSDCReserves,
  }
}