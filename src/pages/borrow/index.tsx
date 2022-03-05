import React, { useCallback } from 'react'
import { useRouter } from 'next/router'
import styled from 'styled-components'

import { BorrowPool } from 'state/borrow/reducer'

import Hero from 'components/Hero'
import Disclaimer from 'components/Disclaimer'
import { useSearch, SearchField, Table } from 'components/App/Borrow'

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

export default function Borrow() {
  const router = useRouter()
  const { snapshot, searchProps } = useSearch()

  const onMintClick = useCallback(
    (contract: string) => {
      router.push(`/borrow/${contract}`)
    },
    [router]
  )

  return (
    <Container>
      <Hero>Get ready to borrow.</Hero>
      <Wrapper>
        <div>
          <SearchField searchProps={searchProps} />
        </div>
        <Table options={snapshot.options as unknown as BorrowPool[]} onMintClick={onMintClick} />
      </Wrapper>
      <Disclaimer />
    </Container>
  )
}
