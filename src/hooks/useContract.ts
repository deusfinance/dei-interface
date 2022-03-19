import { useMemo } from 'react'
import { isAddress } from '@ethersproject/address'
import { Contract } from '@ethersproject/contracts'
import { AddressZero } from '@ethersproject/constants'
import { Web3Provider } from '@ethersproject/providers'

import useWeb3React from './useWeb3'

import ERC20_ABI from 'constants/abi/ERC20.json'
import ERC20_BYTES32_ABI from 'constants/abi/ERC20'
import MULTICALL2_ABI from 'constants/abi/MULTICALL2.json'
import GENERAL_LENDER_ABI from 'constants/abi/GENERAL_LENDER.json'
import LENDER_MANAGER_ABI from 'constants/abi/LENDER_MANAGER.json'
import LENDER_ORACLE_ABI from 'constants/abi/LENDER_ORACLE.json'
import SOLIDEX_LP_DEPOSITOR_ABI from 'constants/abi/SOLIDEX_LP_DEPOSITOR.json'
import VEDEUS_ABI from 'constants/abi/VEDEUS.json'
import REIMBURSE_ABI from 'constants/abi/REIMBURSE.json'

import { Providers } from 'constants/providers'
import { LenderManager, Multicall2, SolidexLpDepositor, Reimburse, veDEUS } from 'constants/addresses'
import { BorrowPool } from 'state/borrow/reducer'

export function useContract<T extends Contract = Contract>(
  addressOrAddressMap: string | null | undefined,
  ABI: any,
  withSignerIfPossible = true
): T | null {
  const { library, account, chainId } = useWeb3React()

  return useMemo(() => {
    if (!addressOrAddressMap || !ABI || !library || !chainId) return null
    let address: string | undefined
    if (typeof addressOrAddressMap === 'string') address = addressOrAddressMap
    else address = addressOrAddressMap[chainId]
    if (!address) return null
    try {
      return getContract(address, ABI, library, withSignerIfPossible && account ? account : undefined)
    } catch (error) {
      console.error('Failed to get contract', error)
      return null
    }
  }, [addressOrAddressMap, ABI, library, chainId, withSignerIfPossible, account]) as T
}

export function useERC20Contract(tokenAddress: string | null | undefined, withSignerIfPossible?: boolean) {
  return useContract(tokenAddress, ERC20_ABI, withSignerIfPossible)
}

export function useBytes32TokenContract(tokenAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(tokenAddress, ERC20_BYTES32_ABI, withSignerIfPossible)
}

export function useGeneralLenderContract(pool: BorrowPool) {
  return useContract(pool.generalLender, GENERAL_LENDER_ABI)
}

export function useReimburseContract() {
  const { chainId } = useWeb3React()
  const address = useMemo(() => (chainId ? Reimburse[chainId] : undefined), [chainId])
  return useContract(address, REIMBURSE_ABI)
}

export function useVeDeusContract() {
  const { chainId } = useWeb3React()
  const address = useMemo(() => (chainId ? veDEUS[chainId] : undefined), [chainId])
  return useContract(address, VEDEUS_ABI)
}

export function useOracleContract(pool: BorrowPool) {
  return useContract(pool.oracle, LENDER_ORACLE_ABI)
}

export function useSolidexLpDepositor() {
  const { chainId } = useWeb3React()
  const address = useMemo(() => (chainId ? SolidexLpDepositor[chainId] : undefined), [chainId])
  return useContract(address, SOLIDEX_LP_DEPOSITOR_ABI)
}

export function useLenderManagerContract() {
  const { chainId } = useWeb3React()
  const address = useMemo(() => (chainId ? LenderManager[chainId] : undefined), [chainId])
  return useContract(address, LENDER_MANAGER_ABI)
}

export function useMulticall2Contract() {
  const { chainId } = useWeb3React()
  const address = useMemo(() => (chainId ? Multicall2[chainId] : undefined), [chainId])
  return useContract(address, MULTICALL2_ABI)
}

export function getProviderOrSigner(library: any, account?: string): any {
  return account ? getSigner(library, account) : library
}

export function getSigner(library: any, account: string): any {
  return library.getSigner(account).connectUnchecked()
}

export function getContract(
  address: string,
  ABI: any,
  library: Web3Provider,
  account?: string,
  targetChainId?: number
): Contract | null {
  if (!isAddress(address) || address === AddressZero) {
    throw new Error(`Invalid 'address' parameter '${address}'.`)
  }

  let providerOrSigner
  if (targetChainId) {
    providerOrSigner = getProviderOrSigner(Providers[targetChainId], account)
  } else {
    providerOrSigner = getProviderOrSigner(library, account)
  }

  return new Contract(address, ABI, providerOrSigner) as any
}
