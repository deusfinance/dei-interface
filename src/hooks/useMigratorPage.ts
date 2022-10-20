import { useEffect, useMemo, useState } from 'react'

import { useSingleContractMultipleMethods } from 'state/multicall/hooks'
import { useCollateralPoolContract, useMigratorContract, useOracleContract2 } from 'hooks/useContract'
import { useSupportedChainId } from 'hooks/useSupportedChainId'
import useWeb3React from 'hooks/useWeb3'

// import snapshot from 'constants/files/maxActiveLiquidity-snapshot.json'
import { toBN } from 'utils/numbers'
import { useGetOracleAddress } from './useVDeusStats'
import { formatUnits } from '@ethersproject/units'
import { makeHttpRequest } from 'utils/http'
import { INFO_URL } from 'constants/misc'

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
  const contract = useMigratorContract()
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
  const { claimedBDEI } = useClaimedBDEI()
  const claimedBDEIAmount = formatUnits(claimedBDEI.toString(), 18)
  const merkleClaimableBDEI = formatUnits(useMerkleClaimableBDEI().toString(), 18)

  return useMemo(
    () => ({
      totalClaimableBDEI: account ? merkleClaimableBDEI : '0',
      availableClaimableBDEI: account ? toBN(merkleClaimableBDEI).minus(toBN(claimedBDEIAmount)).toString() : '0',
    }),
    [account, merkleClaimableBDEI, claimedBDEIAmount]
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
      vDEUSPrice: vDEUSPriceAmount && Number(vDEUSPriceAmount) > 250 ? vDEUSPriceAmount : '250',
    }),
    [vDEUSPriceAmount]
  )
}

export function useMerkleClaimableBDEI(): string {
  const { account } = useWeb3React()
  const [totalClaimableBDEI, setTotalClaimableBDEI] = useState('0')

  useEffect(() => {
    try {
      if (!account) return
      const { href: url } = new URL(`/bond-merkle/liquidity/proof/${account.toLowerCase()}/`, INFO_URL)
      makeHttpRequest(url).then((data) => {
        data ? setTotalClaimableBDEI(data['value']) : setTotalClaimableBDEI('0')
      })
    } catch (err) {
      throw err
    }
  }, [account])

  return totalClaimableBDEI
}
