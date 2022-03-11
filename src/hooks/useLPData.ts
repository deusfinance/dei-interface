import { formatUnits } from '@ethersproject/units'
import { useMemo } from 'react'

import { BorrowPool } from 'state/borrow/reducer'
import { useSingleContractMultipleMethods } from 'state/multicall/hooks'
import { useContract } from './useContract'
import useWeb3React from './useWeb3'

export function useLPData(pool: BorrowPool) {
  const { account } = useWeb3React()
  const poolContract = useContract(pool.contract.address, pool.abi)

  const balanceCalls = useMemo(
    () =>
      !account
        ? []
        : [
            {
              methodName: 'claimable0',
              callInputs: [account],
            },
            {
              methodName: 'claimable1',
              callInputs: [account],
            },
          ],
    [account]
  )
  const [balance0, balance1] = useSingleContractMultipleMethods(poolContract, balanceCalls)

  return useMemo(
    () => ({
      balance0: balanceCalls.length && balance0?.result ? formatUnits(balance0.result[0], 18) : '0', // TODO check if decimals is incorrect
      balance1: balanceCalls.length && balance1?.result ? formatUnits(balance1.result[0], 18) : '0', // TODO check if decimals is incorrect
    }),
    [balanceCalls, balance0, balance1]
  )
}
