import React, { useMemo } from 'react'
import styled from 'styled-components'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import BigNumber from 'bignumber.js'

import useWeb3React from 'hooks/useWeb3'
import { useVestedAPY } from 'hooks/useVested'

import { lastThursday } from 'utils/vest'
import { formatAmount } from 'utils/numbers'

dayjs.extend(relativeTime)
dayjs.extend(localizedFormat)

const Wrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  width: 100%;
  gap: 0px;
`

const Row = styled.div`
  display: flex;
  flex-flow: row nowrap;
  width: 100%;
  justify-content: space-between;
  font-size: 0.8rem;

  & > * {
    color: ${({ theme }) => theme.text1};
    &:last-child {
      color: ${({ theme }) => theme.text2};
    }
  }
`

const Title = styled.div`
  font-size: 0.8rem;
  border-bottom: 1px solid ${({ theme }) => theme.border1};
  margin-bottom: 5px;
  padding-bottom: 5px;
  font-weight: bold;
`

export default function UserLockInformation({
  amount,
  selectedDate,
  title,
}: {
  amount: string
  selectedDate: Date
  title?: string
}) {
  const { account, chainId } = useWeb3React()

  const effectiveDate: Date = useMemo(() => {
    return lastThursday(selectedDate)
  }, [selectedDate])

  const lockHasEnded = useMemo(() => dayjs(effectiveDate).isBefore(dayjs()), [effectiveDate])

  const votingPower: string = useMemo(() => {
    if (!account || !chainId || !amount) return '0.00'
    const effectiveWeek = Math.floor(dayjs(effectiveDate).diff(dayjs(), 'week', true))
    return new BigNumber(amount).times(effectiveWeek).div(208).abs().toFixed(2) // 208 = 4 years in weeks
  }, [account, chainId, amount, effectiveDate])

  const { userAPY } = useVestedAPY(undefined, effectiveDate)

  const durationUntilTarget: string = useMemo(() => {
    return dayjs(effectiveDate).fromNow(true)
  }, [effectiveDate])

  return (
    <Wrapper>
      {title && <Title>{title}</Title>}
      <Row>
        <div>Voting Power:</div>
        <div>{votingPower} veDEUS</div>
      </Row>
      <Row>
        <div>Est. APY</div>
        <div>{formatAmount(parseFloat(userAPY), 0)}%</div>
      </Row>
      <Row>
        <div>Expiration in: </div>
        {lockHasEnded ? <div>Expired</div> : <div>~ {durationUntilTarget}</div>}
      </Row>
      <Row>
        <div>Locked until: </div>
        <div>{dayjs(effectiveDate).format('LL')}</div>
      </Row>
    </Wrapper>
  )
}
