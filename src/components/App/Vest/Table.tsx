import React, { useMemo, useState } from 'react'
import styled from 'styled-components'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import localizedFormat from 'dayjs/plugin/localizedFormat'

dayjs.extend(relativeTime)
dayjs.extend(localizedFormat)

import Pagination from 'components/Pagination'
import ImageWithFallback from 'components/ImageWithFallback'
import { RowCenter } from 'components/Row'
import Column from 'components/Column'
import { PrimaryButton } from 'components/Button'
import { Info } from 'components/Icons'

import { useVestedInformation, useVestedAPY } from 'hooks/useVested'
import DEUS_LOGO from '/public/static/images/tokens/deus.svg'
import { formatAmount } from 'utils/numbers'

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

const Cell = styled.td<{
  justify?: boolean
}>`
  text-align: center;
  align-items: center;
  padding: 5px;
  border: 1px solid ${({ theme }) => theme.border1};
  height: 90px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    :nth-child(3),
    :nth-child(4),
    :nth-child(5) {
      display: none;
    }
  `}
`

const NoResults = styled.div`
  text-align: center;
  padding: 20px;
`

const NFTWrap = styled(Column)`
  margin-left: 10px;
  align-items: flex-start;
`

const CellWrap = styled(Column)`
  gap: 5px;
`

const CellRow = styled(RowCenter)`
  gap: 5px;
`

const CellAmount = styled.div`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.text1};
`

const CellDescription = styled.div`
  font-size: 0.6rem;
  color: ${({ theme }) => theme.text2};
`

const itemsPerPage = 10
export default function Table({
  nftIds,
  toggleLockManager,
  toggleAPYManager,
}: {
  nftIds: number[]
  toggleLockManager: (nftId: number) => void
  toggleAPYManager: (nftId: number) => void
}) {
  const [offset, setOffset] = useState(0)

  const paginatedItems = useMemo(() => {
    return nftIds.slice(offset, offset + itemsPerPage)
  }, [nftIds, offset])

  const pageCount = useMemo(() => {
    return Math.ceil(nftIds.length / itemsPerPage)
  }, [nftIds])

  const onPageChange = ({ selected }: { selected: number }) => {
    setOffset(Math.ceil(selected * itemsPerPage))
  }

  return (
    <>
      <Wrapper>
        <TableWrapper>
          <Head>
            <tr>
              <Cell>Token ID</Cell>
              <Cell>Vest Amount</Cell>
              <Cell>Vest Value</Cell>
              <Cell>Vest Expires</Cell>
              <Cell>APY</Cell>
              <Cell>Actions</Cell>
            </tr>
          </Head>
          <tbody>
            {paginatedItems.length > 0 &&
              paginatedItems.map((nftId: number, index) => (
                <TableRow
                  key={index}
                  nftId={nftId}
                  toggleLockManager={toggleLockManager}
                  toggleAPYManager={toggleAPYManager}
                />
              ))}
          </tbody>
        </TableWrapper>
        {paginatedItems.length == 0 && <NoResults>No Results Found</NoResults>}
        {paginatedItems.length > 0 && <Pagination pageCount={pageCount} onPageChange={onPageChange} />}
      </Wrapper>
    </>
  )
}

function TableRow({
  nftId,
  toggleLockManager,
  toggleAPYManager,
}: {
  nftId: number
  toggleLockManager: (nftId: number) => void
  toggleAPYManager: (nftId: number) => void
}) {
  const { deusAmount, veDEUSAmount, lockEnd } = useVestedInformation(nftId)
  const { userAPY } = useVestedAPY(nftId)

  return (
    <Row>
      <Cell>
        <RowCenter>
          <ImageWithFallback src={DEUS_LOGO} alt={`veDeus logo`} width={30} height={30} />
          <NFTWrap>
            <CellAmount>#{nftId}</CellAmount>
            <CellDescription>veDEUS ID</CellDescription>
          </NFTWrap>
        </RowCenter>
      </Cell>
      <Cell>{deusAmount} DEUS</Cell>
      <Cell>{formatAmount(parseFloat(veDEUSAmount))} veDEUS</Cell>
      <Cell>
        <CellWrap>
          <CellAmount>{dayjs(lockEnd).format('LLL')}</CellAmount>
          <CellDescription>Expires in {dayjs(lockEnd).fromNow(true)}</CellDescription>
        </CellWrap>
      </Cell>
      <Cell>
        <CellRow>
          {formatAmount(parseFloat(userAPY), 0)}%
          <Info onClick={() => toggleAPYManager(nftId)} />
        </CellRow>
      </Cell>
      <Cell style={{ padding: '5px 10px' }}>
        <PrimaryButton onClick={() => toggleLockManager(nftId)}>Update Lock</PrimaryButton>
      </Cell>
    </Row>
  )
}
