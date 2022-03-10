import React from 'react'
import styled from 'styled-components'

import { BorrowPool } from 'state/borrow/reducer'

import { Card } from 'components/Card'
import { Info as InfoIcon } from 'components/Icons'
import { CardTitle } from 'components/Title'
import { ToolTip } from 'components/ToolTip'

const Wrapper = styled(Card)`
  display: flex;
  flex-flow: column nowrap;
  gap: 10px;
`

const Row = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
  gap: 10px;

  & > * {
    font-size: 0.7rem;
    &:last-child {
      margin-left: auto;
    }
  }
`

export default function Info({ pool }: { pool: BorrowPool }) {
  return (
    <Wrapper>
      <CardTitle>Info</CardTitle>
      <PositionRow
        label="Maximum c-ratio "
        value={`${pool.ltv}%`}
        explanation="Maximum collateral ratio (MCR) - MCR represents the maximum amount of debt a user can borrow with a selected collateral token."
      />
      <PositionRow
        label="Liquidation fee "
        value={`${pool.liquidationFee.toSignificant()}%`}
        explanation="This is the discount a liquidator gets when buying collateral flagged for liquidation."
      />
      <PositionRow
        label="Borrow fee "
        value={`${pool.borrowFee.toSignificant()}%`}
        explanation={`This fee is added to your debt every time you borrow ${pool.pair.symbol}.`}
      />
      <PositionRow
        label="Interest rate "
        value={`${pool.interestRate.toSignificant()}%`}
        explanation="This is the annualized percent that your debt will increase each year."
      />
    </Wrapper>
  )
}

function PositionRow({ label, value, explanation }: { label: string; value: string; explanation: string }) {
  return (
    <Row>
      <ToolTip id="id" />
      <InfoIcon data-for="id" data-tip={explanation} />
      <div>{label}</div>
      <div>{value}</div>
    </Row>
  )
}
