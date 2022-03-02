import React, { useState } from 'react'
import styled from 'styled-components'

import { useBorrowComponentFromURL } from 'hooks/useBorrowList'

import { Borrow, Repay } from 'components/App/Borrow'
import Hero from 'components/Hero'
import Disclaimer from 'components/Disclaimer'
import { PrimaryButton } from 'components/Button'

const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  overflow: visible;
  margin: 0 auto;
`

const Wrapper = styled(Container)`
  margin: 0 auto;
  margin-top: 50px;
  width: clamp(250px, 90%, 900px);

  & > * {
    &:first-child {
      margin-bottom: 45px;
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

const BorrowButton = styled(PrimaryButton)<{
  active: boolean
}>`
  width: 180px;
  ${({ active }) =>
    !active &&
    `
      background: #2F2F2F;
      border: 1px solid #565656;

      &:focus,
      &:hover {
        background: #474747;
      }
  `}
`

enum BorrowAction {
  BORROW = 'borrow',
  REPAY = 'repay',
}

export default function BorrowDEI() {
  const component = useBorrowComponentFromURL()
  const [selectedAction, setSelectedAction] = useState<BorrowAction>(BorrowAction.BORROW)

  function getMainContent() {
    if (selectedAction === BorrowAction.BORROW) {
      return <Borrow component={component} />
    }
    return <Repay component={component} />
  }

  return (
    <Container>
      <Hero>Borrow DEI</Hero>
      <Wrapper>
        {!component ? (
          <div>The imported contract is not a valid contract.</div>
        ) : (
          <>
            <Navigation>
              <BorrowButton
                active={selectedAction === BorrowAction.BORROW}
                onClick={() => setSelectedAction(BorrowAction.BORROW)}
              >
                {BorrowAction.BORROW}
              </BorrowButton>
              <BorrowButton
                active={selectedAction === BorrowAction.REPAY}
                onClick={() => setSelectedAction(BorrowAction.REPAY)}
              >
                {BorrowAction.REPAY}
              </BorrowButton>
            </Navigation>
            {getMainContent()}
          </>
        )}
      </Wrapper>
      <Disclaimer />
    </Container>
  )
}
