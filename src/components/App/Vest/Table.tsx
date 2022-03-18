import React, { useMemo, useState } from 'react'
import styled from 'styled-components'

import { BorrowPool } from 'state/borrow/reducer'

import Pagination from 'components/Pagination'
import { PrimaryButton } from 'components/Button'
import ImageWithFallback from 'components/ImageWithFallback'
import { RowCenter } from 'components/Row'
import Column from 'components/Column'

import DEUS_LOGO from '/public/static/images/tokens/deus.svg'

const Wrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: space-between;
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
  color: ${({ theme }) => theme.text1};
`

const Cel = styled.td<{
  justify?: boolean
}>`
  text-align: center;
  padding: 5px;
  border: 1px solid ${({ theme }) => theme.border1};
  height: 90px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    :nth-child(3),
    :nth-child(4) {
      display: none;
    }
  `}
  ${({ theme }) => theme.mediaWidth.upToSmall`
    :nth-child(2) {
      display: none;
    }
  `}
`
const NFTWrap = styled(Column)`
  margin-left: 10px;
  align-items: flex-start;
`

const CelWrap = styled(Column)`
  gap: 5px;
`

const CelAmount = styled.div`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.text1};
`

const CelDescription = styled.div`
  font-size: 0.6rem;
  color: ${({ theme }) => theme.text2};
`

const itemsPerPage = 10
export default function Table({ options, onCreate }: { options: BorrowPool[]; onCreate: (tokenId: string) => void }) {
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
            <Cel>Token ID</Cel>
            <Cel>Vest Amount</Cel>
            <Cel>Vest Value</Cel>
            <Cel>Vest Expires</Cel>
            <Cel>Actions</Cel>
          </tr>
        </Head>
        <tbody>
          {paginatedOptions.length ? (
            paginatedOptions.map((pool: BorrowPool, index) => <TableRow key={index} pool={pool} onCreate={onCreate} />)
          ) : (
            <tr>
              <td colSpan={5} style={{ textAlign: 'center', padding: '20px' }}>
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

function TableRow({ pool, onCreate }: { pool: BorrowPool; onCreate: (tokenId: string) => void }) {
  return (
    <Row>
      <Cel>
        <RowCenter>
          <ImageWithFallback src={DEUS_LOGO} alt={`veDeus logo`} width={30} height={30} />
          <NFTWrap>
            <CelAmount>10586</CelAmount>
            <CelDescription>NFT ID</CelDescription>
          </NFTWrap>
        </RowCenter>
      </Cel>
      <Cel>0.11 DEUS</Cel>
      <Cel>0.11 veDEUS</Cel>
      <Cel>
        <CelWrap>
          <CelAmount>2026-02-26</CelAmount>
          <CelDescription>Expires in 4 years</CelDescription>
        </CelWrap>
      </Cel>
      <Cel style={{ padding: '5px 10px' }}>
        <PrimaryButton onClick={() => onCreate('1')}>Manage</PrimaryButton>
      </Cel>
    </Row>
  )
}
