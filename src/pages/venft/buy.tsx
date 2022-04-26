import React, { useCallback } from 'react'
import { useRouter } from 'next/router'
import styled from 'styled-components'

import { BorrowPool, LenderVersion } from 'state/borrow/reducer'
import { useBorrowPools } from 'state/borrow/hooks'
import { useGlobalDEIBorrowed } from 'hooks/usePoolData'

import Hero, { HeroSubtext } from 'components/Hero'
import Disclaimer from 'components/Disclaimer'
import { SearchField, useSearch } from 'components/App/Borrow'
import { Table } from 'components/App/Venft'

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
    &:nth-child(1) {
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

export default function Borrow() {
  const router = useRouter()
  const { snapshot, searchProps } = useSearch()
  const pools = useBorrowPools()
  const { borrowedElastic } = useGlobalDEIBorrowed(pools)
  const onMintClick = useCallback(
    (contract: string, version: LenderVersion) => {
      const param = version == LenderVersion.V1 ? `?version=${version}` : ''
      router.push(`/borrow/${contract}${param}`)
    },
    [router]
  )

  return (
    <Container>
      <Hero>
        <div>BUY veNFT</div>
        <HeroSubtext>Buy veNFT</HeroSubtext>
      </Hero>
      <Wrapper>
        <div>
          <SearchField searchProps={searchProps} />
          {/* <PrimaryButton>Claim All</PrimaryButton> */}
        </div>
        <Table options={snapshot.options as unknown as BorrowPool[]} onMintClick={onMintClick} />
      </Wrapper>
      <Disclaimer />
    </Container>
  )
}
