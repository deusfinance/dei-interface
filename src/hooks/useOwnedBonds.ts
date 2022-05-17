import { useMemo } from 'react'
import useWeb3React from 'hooks/useWeb3'
import { useBondsContract } from 'hooks/useContract'
import { useSingleContractMultipleMethods } from '../state/multicall/hooks'
import { toBN } from 'utils/numbers'

export type BondType = {
  id: number
  amount: number
  apy: number
  startTime: number
  duration: number
  lastClaimTimestamp: number
}

// TODO: check return type
export default function useOwnedBonds() {
  const { account } = useWeb3React()

  const bondsContract = useBondsContract()
  const BondsOfOwner = account
    ? [
        {
          methodName: 'bondsOfOwner',
          callInputs: [account],
        },
      ]
    : []

  const [result] = useSingleContractMultipleMethods(bondsContract, BondsOfOwner)
  const bondResult = result.result

  return useMemo(() => {
    if (!bondResult || !bondResult.length) return []

    return bondResult[0].reduce((acc: BondType[], bond: any) => {
      if (!bond || toBN(bond.duration.toString()).isZero()) return acc

      const bondObject: BondType = {
        id: 0, //TODO
        amount: toBN(bond.amount.toString()).toNumber(),
        apy: toBN(bond.apy.toString()).div(1e16).toNumber(),
        startTime: toBN(bond.startTime.toString()).toNumber(),
        duration: toBN(bond.duration.toString()).toNumber(),
        lastClaimTimestamp: toBN(bond.lastClaimTimestamp.toString()).toNumber(),
      }
      acc.push(bondObject)
      return acc
    }, [])
  }, [bondResult])
}
