import { useMemo } from 'react'
import { formatUnits } from '@ethersproject/units'
import dayjs from 'dayjs'
import BigNumber from 'bignumber.js'

import { useSingleContractMultipleMethods } from 'state/multicall/hooks'
import { useVeDeusContract } from './useContract'
import { useSupportedChainId } from './useSupportedChainId'
import useWeb3React from './useWeb3'
import { useDeusPrice } from './useCoingeckoPrice'

export function useVestedInformation(nftId: number): {
  deusAmount: string
  veDEUSAmount: string
  lockEnd: Date
} {
  const { account, chainId } = useWeb3React()
  const isSupportedChainId = useSupportedChainId()
  const veDEUSContract = useVeDeusContract()

  const calls = useMemo(
    () =>
      !account || !chainId || !isSupportedChainId
        ? []
        : [
            {
              methodName: 'balanceOfNFT',
              callInputs: [nftId],
            },
            {
              methodName: 'locked',
              callInputs: [nftId],
            },
          ],
    [account, chainId, isSupportedChainId, nftId]
  )

  const [balanceResult, lockedResult] = useSingleContractMultipleMethods(veDEUSContract, calls)
  return useMemo(
    () => ({
      deusAmount: calls.length && lockedResult?.result ? formatUnits(lockedResult.result[0], 18) : '0',
      veDEUSAmount: calls.length && balanceResult?.result ? formatUnits(balanceResult.result[0], 18) : '0',
      lockEnd:
        calls.length && lockedResult?.result
          ? dayjs.unix(Number(formatUnits(lockedResult.result[1], 0))).toDate()
          : new Date(),
    }),
    [calls, balanceResult, lockedResult]
  )
}

const DEUS_EMISSION_PER_WEEK = 2250 // TODO turn this into a hook
const CIRCULATING_SUPPLY = 105800 // TODO turn this into a hook
const WEEKLY_ACCRUED_DEI_FEES = '109226.862690860837326731' // TODO naturally we cant use this forever, upgrade to subgraphs IMMEDIATELY

export function useVestedAPY(
  nftId?: number,
  userInputLockEnd?: Date
): {
  weeklyDEUSEmission: number
  totalVeDEUS: string
  lockedVeDEUS: string
  antiDilutiveAPY: string
  deiAPY: string
  bribesAPY: string
  globalAPY: string
  userAPY: string
} {
  const { account, chainId } = useWeb3React()
  const isSupportedChainId = useSupportedChainId()
  const veDEUSContract = useVeDeusContract()
  const effectiveNftId = useMemo(() => nftId ?? 0, [nftId])
  const { lockEnd } = useVestedInformation(effectiveNftId)
  const effectiveLockEnd = useMemo(() => userInputLockEnd ?? lockEnd, [userInputLockEnd, lockEnd])
  const deusPrice = useDeusPrice()

  const veDEUSCalls = useMemo(
    () =>
      !account || !chainId || !isSupportedChainId
        ? []
        : [
            {
              methodName: 'totalSupply',
              callInputs: [],
            },
            {
              methodName: 'supply',
              callInputs: [],
            },
          ],
    [account, chainId, isSupportedChainId]
  )

  const [totalSupplyResult, supplyResult] = useSingleContractMultipleMethods(veDEUSContract, veDEUSCalls)

  const {
    totalVeDEUS,
    lockedVeDEUS,
  }: {
    totalVeDEUS: string
    lockedVeDEUS: string
  } = useMemo(
    () => ({
      totalVeDEUS: veDEUSCalls.length && totalSupplyResult?.result ? formatUnits(totalSupplyResult.result[0], 18) : '0',
      lockedVeDEUS: veDEUSCalls.length && supplyResult?.result ? formatUnits(supplyResult.result[0], 18) : '0',
    }),
    [veDEUSCalls, totalSupplyResult, supplyResult]
  )

  const annualUSDEmissionToVeDEUS: BigNumber = useMemo(() => {
    const lockedAntiDilutiveShare = new BigNumber(lockedVeDEUS).div(CIRCULATING_SUPPLY)
    const annualDEUSEmissionToVeDEUS = lockedAntiDilutiveShare.times(DEUS_EMISSION_PER_WEEK).div(7).times(365)
    return annualDEUSEmissionToVeDEUS.times(deusPrice)
  }, [lockedVeDEUS, deusPrice])

  const annualDEIEmissionToVeDEUS: BigNumber = useMemo(
    () => new BigNumber(WEEKLY_ACCRUED_DEI_FEES).div(7).times(365),
    []
  )

  const totalValueToVeDEUS: BigNumber = useMemo(
    () => annualUSDEmissionToVeDEUS.plus(annualDEIEmissionToVeDEUS),
    [annualUSDEmissionToVeDEUS, annualDEIEmissionToVeDEUS]
  )

  const globalAPY: BigNumber = useMemo(
    () => totalValueToVeDEUS.div(totalVeDEUS).div(deusPrice).times(100),
    [totalValueToVeDEUS, totalVeDEUS, deusPrice]
  )

  const userAPY: BigNumber = useMemo(() => {
    const lockDurationInDays = Math.abs(dayjs().diff(effectiveLockEnd, 'day'))
    return new BigNumber(lockDurationInDays).div(365 * 4).times(globalAPY)
  }, [effectiveLockEnd, globalAPY])

  return useMemo(
    () => ({
      // for stats
      weeklyDEUSEmission: DEUS_EMISSION_PER_WEEK,
      totalVeDEUS,
      lockedVeDEUS,
      // individual APY components:
      antiDilutiveAPY: annualUSDEmissionToVeDEUS.div(totalVeDEUS).div(deusPrice).times(100).toFixed(),
      deiAPY: annualDEIEmissionToVeDEUS.div(totalVeDEUS).div(deusPrice).times(100).toFixed(),
      bribesAPY: '0',
      // above components result in these:
      globalAPY: globalAPY.toFixed(),
      userAPY: userAPY.toFixed(),
    }),
    [globalAPY, userAPY, deusPrice, annualUSDEmissionToVeDEUS, annualDEIEmissionToVeDEUS, lockedVeDEUS, totalVeDEUS]
  )
}
