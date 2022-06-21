import { formatUnits } from '@ethersproject/units'
import { useMemo } from 'react'
import { useSingleContractMultipleData, useSingleContractMultipleMethods } from 'state/multicall/hooks'
import { toBN } from 'utils/numbers'
import { useVDeusContract } from './useContract'
import useWeb3React from './useWeb3'

export function useVDeusStats(): {
  numberOfVouchers: number
  listOfVouchers: Array<number>
} {
  const { account } = useWeb3React()

  const vDeusContract = useVDeusContract()

  const calls = !account
    ? []
    : [
        {
          methodName: 'balanceOf',
          callInputs: [account],
        },
      ]

  const [vDeusBalance] = useSingleContractMultipleMethods(vDeusContract, calls)

  const { numberOfVouchers } = useMemo(() => {
    return {
      numberOfVouchers: vDeusBalance?.result ? toBN(formatUnits(vDeusBalance.result[0], 0)).toNumber() : 0,
    }
  }, [vDeusBalance])

  const idMapping = Array.from(Array(numberOfVouchers).keys())

  const callInputs = useMemo(() => {
    return !account ? [] : idMapping.map((id) => [account, id])
  }, [account, idMapping])

  const results = useSingleContractMultipleData(vDeusContract, 'tokenOfOwnerByIndex', callInputs)

  const listOfVouchers = useMemo(() => {
    return results
      .reduce((acc: number[], value) => {
        if (!value.result) return acc
        const result = value.result[0].toString()
        if (!result || result === '0') return acc
        acc.push(parseInt(result))
        return acc
      }, [])
      .sort((a: number, b: number) => (a > b ? 1 : -1))
  }, [results])

  return {
    numberOfVouchers,
    listOfVouchers,
  }
}
