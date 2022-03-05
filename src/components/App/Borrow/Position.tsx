import React, { useMemo } from 'react'
import styled from 'styled-components'

import { BorrowPool } from 'state/borrow/reducer'
import { useCurrenciesFromPool } from 'state/borrow/hooks'
import { useCollateralPrice, useUserPoolData } from 'hooks/usePoolData'
import { formatAmount, formatDollarAmount } from 'utils/numbers'

import { Card } from 'components/Card'
import { Info } from 'components/Icons'
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

export default function Position({ pool }: { pool: BorrowPool }) {
  const { pairCurrency } = useCurrenciesFromPool(pool)
  const { userCollateralShare, userBorrowPart } = useUserPoolData(pool)
  const collateralPrice = useCollateralPrice(pool)

  const pairSymbol = useMemo(() => {
    return pairCurrency?.symbol ?? ''
  }, [pairCurrency])

  const liquidationMultiplier = useMemo(() => {
    return (200 - pool.ltv) / 100
  }, [pool])

  const collateralUSDValue = useMemo(() => {
    return userCollateralShare / collateralPrice
  }, [userCollateralShare, collateralPrice])

  const borrowable = useMemo(() => {
    const max = (collateralUSDValue / 100) * (pool.ltv - 1)
    return max - userBorrowPart
  }, [collateralUSDValue, pool, userBorrowPart])

  const liquidationPrice = useMemo(() => {
    return (
      ((userBorrowPart * collateralPrice) / userCollateralShare) * (1 / collateralPrice) * liquidationMultiplier || 0
    )
  }, [userBorrowPart, collateralPrice, userCollateralShare, liquidationMultiplier])

  return (
    <Wrapper>
      <CardTitle>Your Position</CardTitle>
      <PositionRow
        label="Collateral Deposited"
        value={formatAmount(userCollateralShare, 4)}
        explanation="Amount of Tokens Deposited as Collateral"
      />
      <PositionRow
        label="Collateral Value"
        value={formatDollarAmount(collateralUSDValue, 4)}
        explanation={`${pairSymbol} Value of the Collateral Deposited in your Position`}
      />
      <PositionRow
        label={`${pairSymbol} Borrowed`}
        value={formatAmount(userBorrowPart, 4)}
        explanation={`${pairSymbol} Currently Borrowed in your Position`}
      />
      <PositionRow
        label="Liquidation Price"
        value={formatDollarAmount(liquidationPrice, 4)}
        explanation="Collateral Price at which your Position will be Liquidated"
      />
      <PositionRow
        label={`${pairSymbol} Left to Borrow`}
        value={formatAmount(borrowable, 4)}
        explanation={`${pairSymbol} Borrowable based on the Collateral Deposited`}
      />
    </Wrapper>
  )
}

function PositionRow({ label, value, explanation }: { label: string; value: string; explanation: string }) {
  return (
    <Row>
      <ToolTip id="id" />
      <Info data-for="id" data-tip={explanation} />
      <div>{label}</div>
      <div>{value}</div>
    </Row>
  )
}
