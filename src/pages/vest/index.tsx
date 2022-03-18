import React from 'react'
import Link from 'next/link'
import styled from 'styled-components'

import { BorrowPool } from 'state/borrow/reducer'

import Hero, { HeroSubtext } from 'components/Hero'
import Disclaimer from 'components/Disclaimer'
import { useSearch } from 'components/App/Borrow'
import { Table } from 'components/App/Vest'
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
  width: clamp(250px, 90%, 1200px);

  & > * {
    &:nth-child(3) {
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

const CreateButton = styled(PrimaryButton)`
  margin-bottom: 15px;
  max-width: 200px;
  padding: 0px;
  a {
    width: 100%;
    height: 100%;
    padding: 1rem;
  }
`

export default function Vest() {
  const { snapshot } = useSearch()
  return (
    <Container>
      <Hero>
        <div>veDEUS</div>
        <HeroSubtext>Happy dilution protection!</HeroSubtext>
      </Hero>
      <Wrapper>
        <CreateButton>
          <Link href="/vest/create" passHref>
            Create Lock
          </Link>
        </CreateButton>
        <Table
          options={snapshot.options as unknown as BorrowPool[]}
          onCreate={(id: string) => console.log('onCreate Called', id)}
        />
      </Wrapper>
      <Disclaimer />
    </Container>
  )
}
