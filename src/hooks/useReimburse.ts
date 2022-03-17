import { useMemo } from 'react'
import { formatUnits } from '@ethersproject/units'
import { useUserPoolData } from 'hooks/usePoolData'
import { useReimburseContract } from 'hooks/useContract'
import useWeb3React from 'hooks/useWeb3'
import { AddressZero } from '@ethersproject/constants'

import { useSingleContractMultipleMethods } from 'state/multicall/hooks'
import { BorrowPool } from 'state/borrow/reducer'
import { useSupportedChainId } from 'hooks/useSupportedChainId'

export function useReimburse(pool: BorrowPool): {
  isBorrower: boolean
  isLiquidated: boolean
  userCollateral: string
  userRepay: string
  userHolder: string
} {
  const { account } = useWeb3React()
  const isSupportedChainId = useSupportedChainId()

  const { userCollateral } = useUserPoolData(pool)
  const reimburseContract = useReimburseContract()
  const calls = useMemo(
    () =>
      !account || !isSupportedChainId
        ? []
        : [
            {
              methodName: 'userHolder',
              callInputs: [account],
            },
            {
              methodName: 'userCollateral',
              callInputs: [account],
            },
            {
              methodName: 'userDei',
              callInputs: [account],
            },
          ],
    [account, isSupportedChainId]
  )

  const [userHolder, userCollateralReimburse, userRepay] = useSingleContractMultipleMethods(reimburseContract, calls)
  const userHolderAddress = useMemo(
    () => (calls.length && userHolder?.result ? userHolder?.result[0].toString() : AddressZero),
    [calls, userHolder]
  )

  return useMemo(
    () => ({
      isBorrower: parseFloat(userCollateral) > 0,
      isLiquidated:
        calls.length && userCollateralReimburse?.result ? parseFloat(userCollateralReimburse?.result[0]) > 0 : false,
      userCollateral:
        calls.length && userCollateralReimburse.result
          ? formatUnits(userCollateralReimburse?.result[0], pool.contract.decimals)
          : '0',
      userRepay: calls.length && userRepay.result ? formatUnits(userRepay.result[0], pool.contract.decimals) : '0',
      userHolder: userHolderAddress,
    }),
    [userCollateral, userRepay, userHolderAddress, userCollateralReimburse, calls, pool]
  )
}
