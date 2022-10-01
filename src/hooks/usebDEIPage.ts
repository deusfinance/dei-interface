import { useMemo } from 'react'

import { useSingleContractMultipleMethods } from 'state/multicall/hooks'
import { useCollateralPoolContract, useDeiBonderV3Contract, useOracleContract2 } from 'hooks/useContract'
import { useSupportedChainId } from 'hooks/useSupportedChainId'
import useWeb3React from 'hooks/useWeb3'

import snapshot from 'constants/files/maxActiveLiquidity-snapshot.json'
import { toBN } from 'utils/numbers'
import { useGetOracleAddress } from './useVDeusStats'
import { formatUnits } from '@ethersproject/units'

export function useOracleAddress(): string {
  const contract = useCollateralPoolContract()

  const call = useMemo(
    () => [
      {
        methodName: 'oracle',
        callInputs: [],
      },
    ],
    []
  )

  const [oracleAddressRes] = useSingleContractMultipleMethods(contract, call)

  return !oracleAddressRes || !oracleAddressRes.result ? '' : oracleAddressRes.result[0].toString()
}

export function useClaimedBDEI(): { claimedBDEI: string } {
  const contract = useDeiBonderV3Contract()
  const { account } = useWeb3React()
  const isSupportedChainId = useSupportedChainId()

  const calls = useMemo(
    () =>
      !account || !isSupportedChainId
        ? []
        : [
            {
              methodName: 'claimedBDEI',
              callInputs: [account],
            },
          ],
    [account, isSupportedChainId]
  )

  const [claimedBDEI] = useSingleContractMultipleMethods(contract, calls)

  const claimedBDEIAmount = useMemo(
    () => (calls.length && claimedBDEI?.result ? claimedBDEI?.result[0].toString() : '0'),
    [calls, claimedBDEI]
  )

  return useMemo(
    () => ({
      claimedBDEI: claimedBDEIAmount,
    }),
    [claimedBDEIAmount]
  )
}

export function useClaimableBDEI(): { totalClaimableBDEI: string; availableClaimableBDEI: string } {
  const { account } = useWeb3React()
  const parsedSnapshot = snapshot as { [address: string]: string }
  const { claimedBDEI } = useClaimedBDEI()

  return useMemo(
    () => ({
      totalClaimableBDEI: account ? parsedSnapshot[account?.toString()?.toLowerCase()] : '0',
      availableClaimableBDEI: account
        ? toBN(parsedSnapshot[account?.toString()?.toLowerCase()]).minus(toBN(claimedBDEI)).toString()
        : '0',
    }),
    [parsedSnapshot, account, claimedBDEI]
  )
}

export function useGetPrice(): { vDEUSPrice: string } {
  const address = useGetOracleAddress()
  const contract = useOracleContract2(address)

  const calls = useMemo(
    () => [
      {
        methodName: 'getPrice',
        callInputs: [],
      },
    ],
    []
  )

  const [getPrice] = useSingleContractMultipleMethods(contract, calls)

  const vDEUSPriceAmount = useMemo(
    () => (calls.length && getPrice?.result ? toBN(formatUnits(getPrice.result[0].toString(), 6)).toString() : '0'),
    [calls, getPrice]
  )

  return useMemo(
    () => ({
      vDEUSPrice: vDEUSPriceAmount,
    }),
    [vDEUSPriceAmount]
  )
}
