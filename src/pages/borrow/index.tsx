import React, { useCallback, useState } from 'react'
import { useRouter } from 'next/router'
import styled from 'styled-components'

import { BorrowPool, CollateralType } from 'state/borrow/reducer'
import { useBorrowPools } from 'state/borrow/hooks'
import { useGlobalDEIBorrowed } from 'hooks/usePoolData'

import Hero, { HeroSubtext } from 'components/Hero'
import Dropdown from 'components/Dropdown'
import Disclaimer from 'components/Disclaimer'
import { useSearch, SearchField, Table } from 'components/App/Borrow'
import { formatAmount } from 'utils/numbers'

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

export default function Borrow() {
  const router = useRouter()
  const [collateralType, setCollateralType] = useState('')
  const { snapshot, searchProps } = useSearch(collateralType)
  const pools = useBorrowPools()
  const { borrowedElastic } = useGlobalDEIBorrowed(pools)

  const onMintClick = useCallback(
    (contract: string, id: number | undefined) => {
      const param = id != undefined ? `/${id}` : ''
      router.push(`/borrow/${contract}${param}`)
    },
    [router]
  )

  return (
    <Container>
      <Hero>
        <div>Imago DEI</div>
        <HeroSubtext>Borrow DEI against Interest Bearing Tokens.</HeroSubtext>
      </Hero>
      <Wrapper>
        <div style={{ marginBottom: '15px' }}>Global DEI Borrowed: {formatAmount(parseFloat(borrowedElastic))}</div>
        <div>
          <SearchField searchProps={searchProps} />
          <Dropdown
            options={[
              { value: '', label: 'All' },
              { value: CollateralType.OXDAO, label: '0xDAO' },
              { value: CollateralType.SOLIDEX, label: 'Solidex' },
            ]}
            placeholder="Select Collateral Type"
            defaultValue={collateralType}
            onSelect={setCollateralType}
            width="200px"
          />
        </div>
        <Table options={snapshot.options as unknown as BorrowPool[]} onMintClick={onMintClick} />
      </Wrapper>
      <Disclaimer />
    </Container>
  )
}
