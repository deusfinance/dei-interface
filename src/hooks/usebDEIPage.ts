import { useMemo } from 'react'
import { useSingleContractMultipleMethods } from 'state/multicall/hooks'
import { useCollateralPoolContract } from './useContract'

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
