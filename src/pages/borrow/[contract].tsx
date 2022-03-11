import React, { useCallback, useState } from 'react'
import styled from 'styled-components'

import { BorrowAction } from 'state/borrow/reducer'
import { useBorrowPoolFromURL, useCurrenciesFromPool } from 'state/borrow/hooks'
import { useSupportedChainId } from 'hooks/useSupportedChainId'

import { Borrow, Balances, Info, Position } from 'components/App/Borrow'
import Hero from 'components/Hero'
import Disclaimer from 'components/Disclaimer'
import { PrimaryButton } from 'components/Button'
import { ArrowBubble } from 'components/Icons'
import { useRouter } from 'next/router'

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
`

const ReturnWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  gap: 10px;
  align-items: center;
  justify-content: flex-start;
  overflow: visible;
  font-size: 0.9rem;
  margin-bottom: 20px;

  &:hover {
    cursor: pointer;
  }

  & > * {
    &:first-child {
      transform: rotate(90deg);
    }
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin-bottom: 5px;
  `}
`

const Navigation = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  padding: 1px;
  margin-bottom: 30px;
  display: flex;
  flex-flow: row wrap;
  width: 100%;
  gap: 15px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin: 0;
  `}
`

const BorrowButton = styled(PrimaryButton)`
  width: 180px;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
     width: fit-content;
  `}
`

const CardWrapper = styled.div`
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  gap: 10px;
  & > * {
    flex: 1;
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-flow: column nowrap;
  `}
`

export default function BorrowDEI() {
  const router = useRouter()
  const pool = useBorrowPoolFromURL()
  const { collateralCurrency, borrowCurrency } = useCurrenciesFromPool(pool ?? undefined)
  const [selectedAction, setSelectedAction] = useState<BorrowAction>(BorrowAction.BORROW)
  const isSupportedChainId = useSupportedChainId()

  const onReturnClick = useCallback(() => {
    router.push('/borrow')
  }, [router])

  return (
    <Container>
      <Hero>Borrow {borrowCurrency?.symbol}</Hero>
      <Wrapper>
        <ReturnWrapper onClick={onReturnClick}>
          <ArrowBubble size={20}>Back</ArrowBubble>
          Pool Overview
        </ReturnWrapper>
        {!pool ? (
          <div>The imported contract is not a valid pool.</div>
        ) : !isSupportedChainId ? (
          <div>You are not connected with the Fantom Network.</div>
        ) : !collateralCurrency || !borrowCurrency ? (
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
