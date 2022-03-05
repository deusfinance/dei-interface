import React, { useMemo } from 'react'
import styled from 'styled-components'

import { BorrowPool } from 'state/borrow/reducer'
import { Card } from 'components/Card'

const Wrapper = styled(Card)`
  display: flex;
  flex-flow: column nowrap;
  gap: 10px;
  background: ${({ theme }) => theme.bg1};
  padding: 0.9rem;
`

const Row = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  font-size: 0.8rem;
`

export default function SummaryPanel({ pool }: { pool: BorrowPool }) {
  const pairAmount = useMemo(() => {
    return '0'
  }, [])
  return (
    <Wrapper>
      <Row>
        <div>{pool.pair.symbol} Amount</div>
        <div>{pairAmount}</div>
      </Row>
    </Wrapper>
  )
}
