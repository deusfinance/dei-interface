import { useMemo } from 'react'
import { formatUnits } from '@ethersproject/units'

import { BorrowPool, CollateralType } from 'state/borrow/reducer'
import { useSingleContractMultipleMethods } from 'state/multicall/hooks'
import { useOxDaoHolderFactory, useSolidexLpDepositor } from 'hooks/useContract'
import useWeb3React from 'hooks/useWeb3'

export function usePendingLenderRewards(pool: BorrowPool, userHolder: string) {
  const { account } = useWeb3React()
  const SolidexLPDepositorContract = useSolidexLpDepositor()
  const OxDaoFactoryContract = useOxDaoHolderFactory()

  const [contract, balanceCalls] = useMemo(() => {
    if (!account || !userHolder) return [null, []]
    if (pool.type == CollateralType.SOLIDEX) {
      return [
        SolidexLPDepositorContract,
        [
          {
            methodName: 'pendingRewards',
            callInputs: [userHolder, [pool.lpPool]],
          },
        ],
      ]
    }
    if (pool.type == CollateralType.OXDAO) {
      return [
        OxDaoFactoryContract,
        [
          {
            methodName: 'earned',
            callInputs: [userHolder, pool.contract.address],
          },
        ],
      ]
    }
    return [null, []]
  }, [account, userHolder, pool, SolidexLPDepositorContract, OxDaoFactoryContract])

  const [balances] = useSingleContractMultipleMethods(contract, balanceCalls)

  const earned = balanceCalls.length
    ? pool.type == CollateralType.SOLIDEX
      ? balances?.result?.pending[0]
      : balances?.result && balances?.result[0]
    : null

  //TODO: it should be dynamic for all type Collaterals
  return useMemo(
    () => ({
      balances: [earned ? formatUnits(earned[0], 18) : '0', earned ? formatUnits(earned[1], 18) : '0'],
      symbols: ['SOLID', pool.type == CollateralType.SOLIDEX ? 'SEX' : 'OXD'],
    }),
    [earned, pool]
  )
}
