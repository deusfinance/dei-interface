import React, { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import BigNumber from 'bignumber.js'

import { BorrowPool } from 'state/borrow/reducer'
import { useCurrenciesFromPool } from 'state/borrow/hooks'
import { useCollateralPrice, useLiquidationPrice, useUserPoolData } from 'hooks/usePoolData'
import { useLPData } from 'hooks/useLPData'
import { useContract } from 'hooks/useContract'
import { formatAmount, formatDollarAmount } from 'utils/numbers'

import { Card } from 'components/Card'
import { DotFlashing, Info } from 'components/Icons'
import { CardTitle } from 'components/Title'
import { ToolTip } from 'components/ToolTip'
import { PrimaryButton } from 'components/Button'

const Wrapper = styled(Card)`
  display: flex;
  flex-flow: column nowrap;
  gap: 10px;
  max-width: 280px;

  & > * {
    &:last-child {
      margin-top: auto;
    }
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    max-width: 100%;
  `}
`

const Column = styled.div`
  display: flex;
  flex-flow: column nowrap;
  gap: 2px;
`

const Row = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
  gap: 10px;

  & > * {
    font-size: 0.6rem;
    &:last-child {
      margin-left: auto;
    }
  }
`

const SubLabel = styled.div`
  font-size: 0.5rem;
  margin-left: 25px;
`

const StyledPrimaryButton = styled(PrimaryButton)`
  font-size: 0.8rem;
  padding: 1rem 0;
`

export default function Position({ pool }: { pool: BorrowPool }) {
  const { borrowCurrency } = useCurrenciesFromPool(pool)
  const { userCollateral, userBorrow, userDebt, userCap } = useUserPoolData(pool)
  const collateralPrice = useCollateralPrice(pool)
  const liquidationPrice = useLiquidationPrice(pool)
  const poolContract = useContract(pool.contract.address, pool.abi, true)
  const { balance0, balance1 } = useLPData(pool)
  const [awaitingClaimConfirmation, setAwaitingClaimConfirmation] = useState<boolean>(false)

  const borrowSymbol = useMemo(() => {
    return borrowCurrency?.symbol ?? ''
  }, [borrowCurrency])

  const collateralUSDValue = useMemo(() => {
    return new BigNumber(userCollateral).times(collateralPrice).toNumber()
  }, [userCollateral, collateralPrice])

  const borrowable = useMemo(() => {
    return new BigNumber(userCap).minus(userDebt).toNumber()
  }, [userCap, userDebt])

  const onClaim = useCallback(async () => {
    try {
      if (!poolContract) return
      setAwaitingClaimConfirmation(true)
      await poolContract.claimFees([])
      setAwaitingClaimConfirmation(false)
    } catch (err) {
      console.error(err)
      setAwaitingClaimConfirmation(false)
    }
  }, [pool, poolContract])

  function getClaimButton() {
    if (awaitingClaimConfirmation) {
      return (
        <StyledPrimaryButton active>
          Awaiting Confirmation <DotFlashing style={{ marginLeft: '10px' }} />
        </StyledPrimaryButton>
      )
    }
    return <StyledPrimaryButton onClick={onClaim}>Claim Rewards</StyledPrimaryButton>
  }

  return (
    <Wrapper>
      <CardTitle>Your Position</CardTitle>
      <PositionRow
        label="Collateral Deposited"
        value={formatAmount(parseFloat(userCollateral), 4)}
        explanation="Amount of Tokens Deposited as Collateral"
      />
      <PositionRow
        label="Collateral Value"
        value={formatDollarAmount(collateralUSDValue, 4)}
        explanation={`${borrowSymbol} Value of the Collateral Deposited in your Position`}
      />
      <PositionRow
        label={`${borrowSymbol} Borrowed`}
        value={formatAmount(parseFloat(userBorrow), 4)}
        explanation={`${borrowSymbol} Currently Borrowed in your Position`}
      />
      <PositionRow
        label="Outstanding Debt"
        value={formatAmount(parseFloat(userDebt), 4)}
        explanation={`${borrowSymbol} Amount to be Repayed`}
      />
      <PositionRow
        label="Liquidation Price"
        value={liquidationPrice}
        explanation="Collateral Price at which your Position will be Liquidated"
      />
      <PositionRow
        label={`${borrowSymbol} Left to Borrow`}
        value={formatAmount(borrowable, 3)}
        explanation={`${borrowSymbol} Borrowable based on the Collateral Deposited`}
      />
      <PositionRow
        label="Underlying LP Rewards"
        subLabel={`${balance0} SOLID + ${balance1} SEX`}
        value=""
        explanation="SEX + SOLID your position has earned so far"
      />
      {getClaimButton()}
    </Wrapper>
  )
}

function PositionRow({
  label,
  subLabel,
  value,
  explanation,
}: {
  label: string
  subLabel?: string
  value: string
  explanation: string
}) {
  return (
    <Column>
      <Row>
        <ToolTip id="id" />
        <Info data-for="id" data-tip={explanation} size={15} />
        <div>{label}</div>
        <div>{value}</div>
      </Row>
      {subLabel && <SubLabel>{subLabel}</SubLabel>}
    </Column>
  )
}
