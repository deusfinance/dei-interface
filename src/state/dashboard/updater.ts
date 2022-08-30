import { useEffect, useMemo } from 'react'

import { useTwapOracleContract } from 'hooks/useContract'
import { updateExpiredPrice } from './reducer'
import { SolidlyChains } from 'constants/chains'
import useWeb3React from 'hooks/useWeb3'
import { useAppDispatch } from 'state'
import { useBlockTimestamp } from 'state/application/hooks'
import { useSingleContractMultipleMethods } from 'state/multicall/hooks'
import { toBN } from 'utils/numbers'

export default function Updater(): null {
  const { chainId } = useWeb3React()
  const dispatch = useAppDispatch()
  const TwapOracle = useTwapOracleContract()
  const isSupported: boolean = useMemo(() => {
    return chainId ? Object.values(SolidlyChains).includes(chainId) : false
  }, [chainId])

  const twapCalls = useMemo(
    () =>
      !isSupported
        ? []
        : [
            { methodName: 'blockTimestampLast', callInputs: [] },
            { methodName: 'period', callInputs: [] },
          ],
    [isSupported]
  )

  const twapResponse = useSingleContractMultipleMethods(TwapOracle, twapCalls)

  const blockTimestamp = useBlockTimestamp()

  useEffect(() => {
    const [blockTimestampLast, period] = twapResponse
    if (blockTimestampLast?.result && period?.result && blockTimestamp) {
      const blockTimestampLastValue = toBN(blockTimestampLast.result[0].toString()).toNumber()
      const periodValue = toBN(period.result[0].toString()).toNumber()
      const timeElapsed = blockTimestamp - blockTimestampLastValue
      const result = periodValue < timeElapsed
      dispatch(updateExpiredPrice(result))
    }
  }, [dispatch, twapResponse, blockTimestamp])

  return null
}
