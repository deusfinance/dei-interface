import React from 'react'
import styled from 'styled-components'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import utc from 'dayjs/plugin/utc'

import { formatAmount } from 'utils/numbers'

dayjs.extend(utc)
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

export default function BondsInformation({
  title,
  selectedDate,
  bondsAPY = '100',
}: {
  selectedDate: Date
  bondsAPY?: string
  title?: string
}) {
  return (
    <Wrapper>
      {title && <Title>{title}</Title>}
      <Row>
        <div>APY</div>
        <div>{formatAmount(parseFloat(bondsAPY), 0)}%</div>
      </Row>
      <Row>
        <div>Locked until: (UTC)</div>
        <div>{dayjs.utc(selectedDate).format('LL')} ( one Year)</div>
      </Row>
    </Wrapper>
  )
}
