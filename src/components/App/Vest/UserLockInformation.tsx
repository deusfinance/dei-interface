import React, { useMemo } from 'react'
import styled from 'styled-components'
import { RowBetween } from 'components/Row'
import useWeb3React from 'hooks/useWeb3'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import BigNumber from 'bignumber.js'

dayjs.extend(relativeTime)
dayjs.extend(localizedFormat)

const Wrapper = styled(RowBetween)`
  margin: 15px 0;
`

const VotePower = styled.div`
  text-align: left;
  & > * {
    &:first-child {
      font-size: 0.8rem;
      margin-bottom: 5px;
    }
    &:last-child {
      font-size: 1.2rem;
    }
  }
`

const LockWrap = styled.div`
  text-align: right;
  color: ${({ theme }) => theme.text2};
  font-size: 0.7rem;
`

export default function DynamicInfo({ amount, selectedDate }: { amount: string; selectedDate: Date }) {
  const { account, chainId } = useWeb3React()

  const votingPower = useMemo(() => {
    if (!account || !chainId || !amount) return '0'
    const effectiveWeek = Math.floor(dayjs(selectedDate).diff(dayjs(), 'day', true))
    return new BigNumber(amount)
      .times(effectiveWeek)
      .div(365 * 4)
      .toPrecision(6) // 208 = 4 years in weeks
  }, [account, chainId, amount, selectedDate])

  const targetDate = useMemo(() => {
    return dayjs(selectedDate).format('LL')
  }, [selectedDate])

  const durationUntilTarget = useMemo(() => {
    return dayjs(selectedDate).fromNow(true)
  }, [selectedDate])

  return (
    <Wrapper>
      <VotePower>
        <div>Your voting power will be: </div>
        <div>{votingPower} veDEUS</div>
      </VotePower>
      <LockWrap>
        <div>
          {votingPower} DEUS expires in {durationUntilTarget}
        </div>
        <div>Locked until {targetDate}</div>
      </LockWrap>
    </Wrapper>
  )
}
