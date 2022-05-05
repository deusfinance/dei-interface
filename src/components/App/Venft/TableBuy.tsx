import React, { useMemo, useState } from 'react'
import styled from 'styled-components'

import Pagination from 'components/Pagination'
import { PrimaryButton } from 'components/Button'
import { Cel, Head, Row, TableWrapper, Wrapper } from 'components/Table'
import { VenftItem } from '../../../api/types'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import relativeTime from 'dayjs/plugin/relativeTime'
import localizedFormat from 'dayjs/plugin/localizedFormat'

dayjs.extend(utc)
dayjs.extend(relativeTime)
dayjs.extend(localizedFormat)

const VeNFTCel = styled(Cel)`
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

const itemsPerPage = 10
export default function TableBuy({ venftItems }: { venftItems: VenftItem[] }) {
  const [offset, setOffset] = useState(0)

  const paginatedOptions = useMemo(() => {
    return venftItems.slice(offset, offset + itemsPerPage)
  }, [venftItems, offset])

  const pageCount = useMemo(() => {
    return Math.ceil(venftItems.length / itemsPerPage)
  }, [venftItems])

  const onPageChange = ({ selected }: { selected: number }) => {
    setOffset(Math.ceil(selected * itemsPerPage))
  }

  return (
    <Wrapper>
      <TableWrapper>
        <Head>
          <tr>
            <Cel>Token ID</Cel>
            <Cel>Needs Amount</Cel>
            <Cel>Time</Cel>
            <Cel>Action</Cel>
          </tr>
        </Head>
        <tbody>
          {paginatedOptions.length ? (
            paginatedOptions.map((item, index) => <TableRow key={index} venftItem={item} />)
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

function TableRow({ venftItem }: { venftItem: VenftItem }) {
  return (
    <Row>
      <VeNFTCel>veNFT #{venftItem.tokenId}</VeNFTCel>
      <VeNFTCel>
        {/*{parseFloat(fromWei(venftItem.needsAmount))} */}
        fSolid
      </VeNFTCel>
      <VeNFTCel>{dayjs.utc(new Date(venftItem.endTime * 1000)).fromNow(true)}</VeNFTCel>
      <VeNFTCel style={{ padding: '5px 10px' }}>
        <PrimaryButton>Buy</PrimaryButton>
      </VeNFTCel>
    </Row>
  )
}
