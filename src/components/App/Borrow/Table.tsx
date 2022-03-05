import React, { useMemo, useState } from 'react'
import styled from 'styled-components'

import { BorrowPool } from 'state/borrow/reducer'
import useCurrencyLogo from 'hooks/useCurrencyLogo'
import { useGlobalPoolData } from 'hooks/usePoolData'

import Pagination from 'components/Pagination'
import { PrimaryButton } from 'components/Button'
import ImageWithFallback from 'components/ImageWithFallback'
import { formatAmount } from 'utils/numbers'

const Wrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: space-between;
  min-height: 350px; /* hardcoded because a non-complete page will shift the height */
`

const TableWrapper = styled.table`
  width: 100%;
  overflow: hidden;
  table-layout: fixed;
  border-collapse: collapse;
`

const Head = styled.thead`
  & > tr {
    height: 56px;
    font-size: 0.9rem;
    color: ${({ theme }) => theme.text1};
    background: ${({ theme }) => theme.bg0};
  }
`

const Row = styled.tr`
  align-items: center;
  height: 21px;
  font-size: 0.8rem;
  line-height: 0.8rem;
  color: ${({ theme }) => theme.text1};
`

const Cel = styled.td<{
  justify?: boolean
}>`
  text-align: center;
  padding: 5px;
  border: 1px solid ${({ theme }) => theme.border1};
  height: 90px;
`

const Component = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: center;

  & > * {
    &:first-child {
      transform: translateX(10%);
    }
    &:nth-child(2) {
      transform: translateX(-10%);
    }
  }
`

const itemsPerPage = 10
export default function Table({
  options,
  onMintClick,
}: {
  options: BorrowPool[]
  onMintClick: (contract: string) => void
}) {
  const [offset, setOffset] = useState(0)

  const paginatedOptions = useMemo(() => {
    return options.slice(offset, offset + itemsPerPage)
  }, [options, offset])

  const pageCount = useMemo(() => {
    return Math.ceil(options.length / itemsPerPage)
  }, [options])

  const onPageChange = ({ selected }: { selected: number }) => {
    setOffset(Math.ceil(selected * itemsPerPage))
  }

  return (
    <Wrapper>
      <TableWrapper>
        <Head>
          <tr>
            <Cel>Composition</Cel>
            <Cel>Total DEI Borrowed</Cel>
            <Cel>DEI left to borrow</Cel>
            <Cel>Interest</Cel>
            <Cel>Liquidation Fee</Cel>
            <Cel>Action</Cel>
          </tr>
        </Head>
        <tbody>
          {paginatedOptions.length ? (
            paginatedOptions.map((pool: BorrowPool, index) => (
              <TableRow key={index} pool={pool} onMintClick={onMintClick} />
            ))
          ) : (
            <tr>
              <td colSpan={7} style={{ textAlign: 'center', padding: '20px' }}>
                No Results Found
              </td>
            </tr>
          )}
        </tbody>
      </TableWrapper>
      {paginatedOptions.length > 0 && <Pagination pageCount={pageCount} onPageChange={onPageChange} />}
    </Wrapper>
  )
}

function TableRow({ pool, onMintClick }: { pool: BorrowPool; onMintClick: (contract: string) => void }) {
  const logoOne = useCurrencyLogo(pool.collateral.address)
  const logoTwo = useCurrencyLogo(pool.pair.address)

  const { borrowedBase, maxBorrow } = useGlobalPoolData(pool)

  return (
    <Row>
      <Cel>
        <Component>
          <ImageWithFallback src={logoOne} alt={`${pool.collateral.symbol} logo`} width={20} height={20} />
          <ImageWithFallback src={logoTwo} alt={`${pool.pair.symbol} logo`} width={20} height={20} />
          {pool.composition}
        </Component>
      </Cel>
      <Cel>{formatAmount(borrowedBase)}</Cel>
      <Cel>{formatAmount(maxBorrow)}</Cel>
      <Cel>{pool.interestRate.toSignificant()}%</Cel>
      <Cel>{pool.liquidationFee.toSignificant()}%</Cel>
      <Cel style={{ padding: '5px 10px' }}>
        <PrimaryButton onClick={() => onMintClick(pool.contract)}>Borrow</PrimaryButton>
      </Cel>
    </Row>
  )
}
