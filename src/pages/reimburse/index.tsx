import React from 'react'
import styled from 'styled-components'

import { BorrowPool } from 'state/borrow/reducer'

import Hero, { HeroSubtext } from 'components/Hero'
import Disclaimer from 'components/Disclaimer'
import { useSearch } from 'components/App/Borrow'
import { Table } from 'components/App/Reimburse'

const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  overflow: visible;
  margin: 0 auto;
`

const Wrapper = styled(Container)`
  margin: 0 auto;
  margin-top: 50px;
  width: clamp(250px, 90%, 1200px);

  & > * {
    &:nth-child(2) {
      margin-bottom: 25px;
      display: flex;
      flex-flow: row nowrap;
      width: 100%;
      gap: 15px;
      & > * {
        &:last-child {
          max-width: 300px;
        }
      }
    }
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    margin-top: 20px;
  `}
`

export default function Reimburse() {
  const { snapshot } = useSearch()
  return (
    <Container>
      <Hero>
        <div>Reimago DEI</div>
        <HeroSubtext>Reimburse for affected User.</HeroSubtext>
      </Hero>
      <Wrapper>
        <Table options={snapshot.options as unknown as BorrowPool[]} />
      </Wrapper>
      <Disclaimer />
    </Container>
  )
}
