import React, { useMemo, useState } from 'react'
import styled from 'styled-components'
import { formatUnits } from '@ethersproject/units'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import localizedFormat from 'dayjs/plugin/localizedFormat'

dayjs.extend(relativeTime)
dayjs.extend(localizedFormat)

import useWeb3React from 'hooks/useWeb3'
import { useSupportedChainId } from 'hooks/useSupportedChainId'
import { useSingleContractMultipleMethods } from 'state/multicall/hooks'
import { useVeDeusContract } from 'hooks/useContract'

import Pagination from 'components/Pagination'
import ImageWithFallback from 'components/ImageWithFallback'
import { RowCenter } from 'components/Row'
import Column from 'components/Column'

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
  padding: 5px;
  border: 1px solid ${({ theme }) => theme.border1};
  height: 90px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    :nth-child(3),
    :nth-child(4) {
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
export default function Table({ nftIds }: { nftIds: number[] }) {
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
    <Wrapper>
      <TableWrapper>
        <Head>
          <tr>
            <Cell>Token ID</Cell>
            <Cell>Vest Amount</Cell>
            <Cell>Vest Value</Cell>
            <Cell>Vest Expires</Cell>
            {/* <Cell>Actions</Cell> */}
          </tr>
        </Head>
        <tbody>
          {paginatedItems.length > 0 &&
            paginatedItems.map((nftId: number, index) => <TableRow key={index} nftId={nftId} />)}
        </tbody>
      </TableWrapper>
      {paginatedItems.length == 0 && <NoResults>No Results Found</NoResults>}
      {paginatedItems.length > 0 && <Pagination pageCount={pageCount} onPageChange={onPageChange} />}
    </Wrapper>
  )
}

function TableRow({ nftId }: { nftId: number }) {
  const { account, chainId } = useWeb3React()
  const isSupportedChainId = useSupportedChainId()
  const veDEUSContract = useVeDeusContract()

  const calls = useMemo(
    () =>
      !account || !chainId || !isSupportedChainId
        ? []
        : [
            {
              methodName: 'balanceOfNFT',
              callInputs: [nftId],
            },
            {
              methodName: 'locked',
              callInputs: [nftId],
            },
          ],
    [account, chainId, isSupportedChainId, nftId]
  )

  const [balanceResult, lockedResult] = useSingleContractMultipleMethods(veDEUSContract, calls)
  const { deusAmount, veDEUSAmount, lockEnd } = useMemo(
    () => ({
      deusAmount: calls.length && lockedResult.result ? formatUnits(lockedResult.result[0], 18) : '0',
      lockEnd: calls.length && lockedResult.result ? parseFloat(formatUnits(lockedResult.result[1], 0)) : 0,
      veDEUSAmount: calls.length && balanceResult.result ? formatUnits(balanceResult.result[0], 18) : '0',
    }),
    [calls, balanceResult, lockedResult]
  )

  return (
    <Row>
      <Cell>
        <RowCenter>
          <ImageWithFallback src={DEUS_LOGO} alt={`veDeus logo`} width={30} height={30} />
          <NFTWrap>
            <CelAmount>{nftId}</CelAmount>
            <CelDescription>veDEUS ID</CelDescription>
          </NFTWrap>
        </RowCenter>
      </Cell>
      <Cell>{deusAmount} DEUS</Cell>
      <Cell>{formatAmount(parseFloat(veDEUSAmount))} veDEUS</Cell>
      <Cell>
        <CelWrap>
          <CelAmount>{dayjs.unix(lockEnd).format('LLL')}</CelAmount>
          <CelDescription>Expires in {dayjs.unix(lockEnd).fromNow(true)}</CelDescription>
        </CelWrap>
      </Cell>
      {/* <Cell style={{ padding: '5px 10px' }}>
        <PrimaryButton>Manage</PrimaryButton>
      </Cell> */}
    </Row>
  )
}
