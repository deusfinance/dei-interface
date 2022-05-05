import React, { useMemo, useState } from 'react'
import styled from 'styled-components'

import { useCurrenciesFromPool } from 'state/borrow/hooks'
import { BorrowPool, LenderVersion } from 'state/borrow/reducer'
import useCurrencyLogo from 'hooks/useCurrencyLogo'
import { useGlobalPoolData, useUserPoolData } from 'hooks/usePoolData'
import { usePendingLenderRewards } from 'hooks/usePendingLenderRewards'

import Pagination from 'components/Pagination'
import { PrimaryButton } from 'components/Button'
import { DualImageWrapper } from 'components/DualImage'
import ImageWithFallback from 'components/ImageWithFallback'
import { formatAmount } from 'utils/numbers'
import { Cel, Head, Row, TableWrapper, Wrapper } from 'components/Table'
import { ToolTip } from 'components/ToolTip'
import { Info as InfoIcon } from 'components/Icons'

export const Deprecated = styled.div`
  color: ${({ theme }) => theme.text3};
  margin: auto;
  margin-top: 10px;
`

const BorrowCel = styled(Cel)`
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

const IconWrap = styled.div`
  margin-left: 5px;
`

const itemsPerPage = 10
export default function Table({
  options,
  onMintClick,
}: {
  options: BorrowPool[]
  onMintClick: (contract: string, id: number | undefined) => void
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
            <BorrowCel>Composition</BorrowCel>
            <BorrowCel>Type</BorrowCel>
            <BorrowCel>Total Borrowed</BorrowCel>
            <BorrowCel>Your Rewards</BorrowCel>
            <BorrowCel>Action</BorrowCel>
          </tr>
        </Head>
        <tbody>
          {paginatedOptions.length ? (
            paginatedOptions.map((pool: BorrowPool, index) => (
              <TableRow key={index} pool={pool} onMintClick={onMintClick} />
            ))
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

function TableRow({
  pool,
  onMintClick,
}: {
  pool: BorrowPool
  onMintClick: (contract: string, id: number | undefined) => void
}) {
  const { borrowCurrency } = useCurrenciesFromPool(pool ?? undefined)
  const logoOne = useCurrencyLogo(pool.token0.address)
  const logoTwo = useCurrencyLogo(pool.token1.address)
  const { userHolder } = useUserPoolData(pool)
  const { balances, symbols } = usePendingLenderRewards(pool, userHolder)
  const { borrowedElastic } = useGlobalPoolData(pool)

  return (
    <Row>
      <Cel>
        <DualImageWrapper>
          <ImageWithFallback src={logoOne} alt={`${pool.token0.symbol} logo`} width={30} height={30} />
          <ImageWithFallback src={logoTwo} alt={`${pool.token1.symbol} logo`} width={30} height={30} />
          {pool.composition}
        </DualImageWrapper>
        {pool.version == LenderVersion.V1 && <Deprecated>(deprecated)</Deprecated>}
      </Cel>
      <Cel>{pool.type}</Cel>
      <Cel>
        {formatAmount(parseFloat(borrowedElastic))} {borrowCurrency?.symbol}
      </Cel>
      <Cel>
        {symbols.map((symbol, index) => {
          return <div key={index}>{`${formatAmount(parseFloat(balances[index]))} ${symbol}`}</div>
        })}
      </Cel>
      <Cel style={{ padding: '5px 10px' }}>
        {!pool.pending ? (
          <PrimaryButton onClick={() => onMintClick(pool.generalLender, pool?.id)}>Borrow</PrimaryButton>
        ) : (
          <>
            <ToolTip id="id" />
            <PrimaryButton disabled={true} onClick={() => onMintClick(pool.generalLender, pool?.id)}>
              <div>Borrow</div>
              <IconWrap data-for="id" data-tip={'max cap is still zero'}>
                <InfoIcon size={15} />
              </IconWrap>
            </PrimaryButton>
          </>
        )}
      </Cel>
    </Row>
  )
}
