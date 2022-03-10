import React, { useState } from 'react'
import styled from 'styled-components'

import { BorrowAction } from 'state/borrow/reducer'
import { useBorrowPoolFromURL, useCurrenciesFromPool } from 'state/borrow/hooks'

import { Borrow, Balances, Info, Position } from 'components/App/Borrow'
import Hero from 'components/Hero'
import Disclaimer from 'components/Disclaimer'
import { PrimaryButton } from 'components/Button'
import { useSupportedChainId } from 'hooks/useSupportedChainId'

const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  overflow: visible;
  margin: 0 auto;
`

const Wrapper = styled(Container)`
  margin: 0 auto;
  margin-top: 50px;
  width: clamp(250px, 90%, 750px);
  gap: 10px;

  & > * {
    &:first-child {
      margin-bottom: 30px;
      display: flex;
      flex-flow: row wrap;
      width: 100%;
      gap: 15px;
    }
  }
`

const Navigation = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  padding: 1px;
`

const BorrowButton = styled(PrimaryButton)`
  width: 180px;
`

const CardWrapper = styled.div`
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  gap: 10px;
  & > * {
    flex: 1;
    &:first-child {
      min-width: 450px;
    }
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-flow: column nowrap;
  `}
`

export default function BorrowDEI() {
  const pool = useBorrowPoolFromURL()
  const { collateralCurrency, pairCurrency } = useCurrenciesFromPool(pool ?? undefined)
  const [selectedAction, setSelectedAction] = useState<BorrowAction>(BorrowAction.BORROW)
  const isSupportedChainId = useSupportedChainId()

  return (
    <Container>
      <Hero>Borrow {pool ? pool.pair.symbol : 'DEI'}</Hero>
      <Wrapper>
        {!pool ? (
          <div>The imported contract is not a valid pool.</div>
        ) : !isSupportedChainId ? (
          <div>You are not connected with the Fantom Network.</div>
        ) : !collateralCurrency || !pairCurrency ? (
          <div>Experiencing issues with the Fantom RPC. Unable to load pools.</div>
        ) : (
          <>
            <Navigation>
              <BorrowButton
                disabled={selectedAction !== BorrowAction.BORROW}
                onClick={() => setSelectedAction(BorrowAction.BORROW)}
              >
                {BorrowAction.BORROW}
              </BorrowButton>
              <BorrowButton
                disabled={selectedAction !== BorrowAction.REPAY}
                onClick={() => setSelectedAction(BorrowAction.REPAY)}
              >
                {BorrowAction.REPAY}
              </BorrowButton>
            </Navigation>
            <CardWrapper>
              <Borrow pool={pool} action={selectedAction} />
              <Position pool={pool} />
            </CardWrapper>
            <CardWrapper>
              <Balances pool={pool} />
              <Info pool={pool} />
            </CardWrapper>
          </>
        )}
      </Wrapper>
      <Disclaimer />
    </Container>
  )
}
