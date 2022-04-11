import { useMemo } from 'react'
import { isAddress } from '@ethersproject/address'
import { Contract } from '@ethersproject/contracts'
import { AddressZero } from '@ethersproject/constants'
import { Web3Provider } from '@ethersproject/providers'

import useWeb3React from './useWeb3'

import ERC20_ABI from 'constants/abi/ERC20.json'
import ERC20_BYTES32_ABI from 'constants/abi/ERC20'
import MULTICALL2_ABI from 'constants/abi/MULTICALL2.json'
import HOLDER_MANAGER from 'constants/abi/HOLDER_MANAGER.json'
import LENDER_ORACLE_ABI from 'constants/abi/LENDER_ORACLE.json'
import SOLIDEX_LP_DEPOSITOR_ABI from 'constants/abi/SOLIDEX_LP_DEPOSITOR.json'
import VEDEUS_ABI from 'constants/abi/VEDEUS.json'
import REIMBURSE_ABI from 'constants/abi/REIMBURSE.json'
import BASE_V1_FACTORY_ABI from 'constants/abi/BASE_V1_FACTORY.json'
import BASE_V1_PAIR_ABI from 'constants/abi/BASE_V1_PAIR.json'
import BASE_V1_VOTER_ABI from 'constants/abi/BASE_V1_VOTER.json'
import BASE_V1_GAUGE_ABI from 'constants/abi/BASE_V1_GAUGE.json'
import BASE_V1_BRIBE_ABI from 'constants/abi/BASE_V1_BRIBE.json'
import BASE_V1_MINTER_ABI from 'constants/abi/BASE_V1_MINTER.json'

import { Providers } from 'constants/providers'
import {
  HolderManager,
  Multicall2,
  SolidexLpDepositor,
  Reimburse,
  veDEUS,
  BaseV1Factory,
  BaseV1Voter,
  ZERO_ADDRESS,
  BaseV1Minter,
} from 'constants/addresses'
import { LenderABI } from 'constants/borrow'
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
    if (!address || address === ZERO_ADDRESS) return null
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
  return useContract(pool.generalLender, LenderABI[pool.version])
}

export function useBaseV1FactoryContract() {
  const { chainId } = useWeb3React()
  const address = useMemo(() => (chainId ? BaseV1Factory[chainId] : undefined), [chainId])
  return useContract(address, BASE_V1_FACTORY_ABI)
}

export function useBaseV1MinterContract() {
  const { chainId } = useWeb3React()
  const address = useMemo(() => (chainId ? BaseV1Minter[chainId] : undefined), [chainId])
  return useContract(address, BASE_V1_MINTER_ABI)
}

export function useBaseV1VoterContract() {
  const { chainId } = useWeb3React()
  const address = useMemo(() => (chainId ? BaseV1Voter[chainId] : undefined), [chainId])
  return useContract(address, BASE_V1_VOTER_ABI)
}

export function useBaseV1PairContract(address: string) {
  return useContract(address, BASE_V1_PAIR_ABI)
}

export function useBaseV1GaugeContract(address: string) {
  return useContract(address, BASE_V1_GAUGE_ABI)
}

export function useBaseV1BribeContract(address: string) {
  return useContract(address, BASE_V1_BRIBE_ABI)
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

export function useHolderManager() {
  const { chainId } = useWeb3React()
  const address = useMemo(() => (chainId ? HolderManager[chainId] : undefined), [chainId])
  return useContract(address, HOLDER_MANAGER)
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
