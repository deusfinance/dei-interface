import React, { useMemo, useState } from 'react'
import styled from 'styled-components'

import Pagination from 'components/Pagination'
import { PrimaryButton } from 'components/Button'
import { Cel, Head, Row, TableWrapper, Wrapper } from 'components/Table'
import { AccountVenftToken } from 'hooks/useVeNFT'
import { fromWei } from 'utils/numbers'
import dayjs from 'dayjs'

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
export default function TableSell({ veNFTTokens }: { veNFTTokens: AccountVenftToken[] }) {
  const [offset, setOffset] = useState(0)

  const paginatedOptions = useMemo(() => {
    return veNFTTokens.slice(offset, offset + itemsPerPage)
  }, [veNFTTokens, offset])

  const pageCount = useMemo(() => {
    return Math.ceil(veNFTTokens.length / itemsPerPage)
  }, [veNFTTokens])

  const onPageChange = ({ selected }: { selected: number }) => {
    setOffset(Math.ceil(selected * itemsPerPage))
  }

  return (
    <Wrapper>
      <TableWrapper>
        <Head>
          <tr>
            <Cel>Token ID</Cel>
            <Cel>You Will Get</Cel>
            <Cel>Time</Cel>
            <Cel>Action</Cel>
          </tr>
        </Head>
        <tbody>
          {paginatedOptions.length ? (
            paginatedOptions.map((item: AccountVenftToken, index) => <TableRow veNFTToken={item} key={index} />)
          ) : (
            <tr>
              <td colSpan={5} style={{ textAlign: 'center', padding: '20px' }} data-testid="venft-sell-no-results">
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

function TableRow({ veNFTToken }: { veNFTToken: AccountVenftToken }) {
  return (
    <Row>
      <VeNFTCel>veNFT #{veNFTToken.tokenId.toNumber()}</VeNFTCel>
      <VeNFTCel>{parseFloat(fromWei(veNFTToken.needsAmount.toNumber()))} fSolid</VeNFTCel>
      <VeNFTCel>{dayjs.utc(new Date(veNFTToken.endTime.toNumber() * 1000)).fromNow(true)}</VeNFTCel>
      <VeNFTCel style={{ padding: '5px 10px' }}>
        <PrimaryButton>Buy</PrimaryButton>
      </VeNFTCel>
    </Row>
  )
}
