import React, { useMemo, useState } from 'react'
import styled from 'styled-components'

import { BorrowComponent } from 'hooks/useBorrowList'
import Pagination from 'components/Pagination'
import { formatAmount } from 'utils/numbers'
import { PrimaryButton } from 'components/Button'

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

const itemsPerPage = 10
export default function Table({
  options,
  onMintClick,
}: {
  options: BorrowComponent[]
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
            <Cel>Component</Cel>
            <Cel>Type</Cel>
            <Cel>Total DEI Borrowed</Cel>
            <Cel>DEI left to borrow</Cel>
            <Cel>Interest</Cel>
            <Cel>Liquidation Fee</Cel>
            <Cel>Action</Cel>
          </tr>
        </Head>
        <tbody>
          {paginatedOptions.length ? (
            paginatedOptions.map((item: BorrowComponent, index) => (
              <TableRow key={index} item={item} onMintClick={onMintClick} />
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

function TableRow({ item, onMintClick }: { item: BorrowComponent; onMintClick: (contract: string) => void }) {
  return (
    <Row>
      <Cel>{item.component}</Cel>
      <Cel>{item.type}</Cel>
      <Cel>{formatAmount(Number(item.totalBorrowed))}</Cel>
      <Cel>{formatAmount(Number(item.remaining))}</Cel>
      <Cel>{item.interest.toSignificant()}%</Cel>
      <Cel>{item.liquidationFee.toSignificant()}%</Cel>
      <Cel style={{ padding: '5px 10px' }}>
        <PrimaryButton onClick={() => onMintClick(item.contract)}>mint</PrimaryButton>
      </Cel>
    </Row>
  )
}
