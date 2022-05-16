import React, { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import utc from 'dayjs/plugin/utc'

import { useBondsContract } from 'hooks/useContract'
import { useHasPendingVest, useTransactionAdder } from 'state/transactions/hooks'
import { useVestedInformation } from 'hooks/useVested'

import Pagination from 'components/Pagination'
import { RowCenter } from 'components/Row'
import Column from 'components/Column'
import { PrimaryButton } from 'components/Button'
import { DotFlashing } from 'components/Icons'

dayjs.extend(utc)
dayjs.extend(relativeTime)
dayjs.extend(localizedFormat)

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

const CellWrap = styled(Column)`
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
export default function Table({ bondIds }: { bondIds: number[] }) {
  const [offset, setOffset] = useState(0)

  const paginatedItems = useMemo(() => {
    return bondIds.slice(offset, offset + itemsPerPage)
  }, [bondIds, offset])

  const pageCount = useMemo(() => {
    return Math.ceil(bondIds.length / itemsPerPage)
  }, [bondIds])

  const onPageChange = ({ selected }: { selected: number }) => {
    setOffset(Math.ceil(selected * itemsPerPage))
  }

  return (
    <>
      <Wrapper>
        <TableWrapper>
          <Head>
            <tr>
              <Cell>Bond ID</Cell>
              <Cell>Bond Amount</Cell>
              <Cell>Bond Expiration</Cell>
              <Cell>Reward</Cell>
              <Cell>Action</Cell>
            </tr>
          </Head>
          <tbody>
            {paginatedItems.length > 0 &&
              paginatedItems.map((bondId: number, index) => <TableRow key={index} bondId={bondId} />)}
          </tbody>
        </TableWrapper>
        {paginatedItems.length == 0 && <NoResults>No Bonds Found</NoResults>}
        {paginatedItems.length > 0 && <Pagination pageCount={pageCount} onPageChange={onPageChange} />}
      </Wrapper>
    </>
  )
}

function TableRow({ bondId }: { bondId: number }) {
  const [awaitingClaimConfirmation, setAwaitingClaimConfirmation] = useState(false)
  const [awaitingClaimAndWithdrawConfirmation, setAwaitingClaimAndWithdrawConfirmation] = useState(false)
  const [pendingTxHash, setPendingTxHash] = useState('')
  const { deusAmount, veDEUSAmount, lockEnd } = useVestedInformation(bondId)
  const bondsContract = useBondsContract()
  const addTransaction = useTransactionAdder()
  const showTransactionPending = useHasPendingVest(pendingTxHash)

  const lockHasEnded = useMemo(() => dayjs.utc(lockEnd).isBefore(dayjs.utc().subtract(10, 'seconds')), [lockEnd]) // subtracting 10 seconds to mitigate this from being true on page load

  const onClaimAndWithdraw = useCallback(async () => {
    try {
      if (!bondsContract || !lockHasEnded) return
      setAwaitingClaimAndWithdrawConfirmation(true)
      const response = await bondsContract.withdraw(bondId)
      addTransaction(response, {
        summary: `Claim Reward And Withdraw #${bondId} from Bonds`,
        vest: { hash: response.hash },
      })
      setPendingTxHash(response.hash)
      setAwaitingClaimAndWithdrawConfirmation(false)
    } catch (err) {
      console.error(err)
      setAwaitingClaimAndWithdrawConfirmation(false)
      setPendingTxHash('')
    }
  }, [bondsContract, lockHasEnded, bondId, addTransaction])

  const onClaim = useCallback(async () => {
    try {
      if (!bondsContract || !lockHasEnded) return
      setAwaitingClaimConfirmation(true)
      const response = await bondsContract.claim(bondId)
      addTransaction(response, { summary: `Claim Bond #${bondId} Reward`, vest: { hash: response.hash } })
      setPendingTxHash(response.hash)
      setAwaitingClaimConfirmation(false)
    } catch (err) {
      console.error(err)
      setAwaitingClaimConfirmation(false)
      setPendingTxHash('')
    }
  }, [bondsContract, lockHasEnded, bondId, addTransaction])

  function getActionButton() {
    const title = !lockHasEnded ? 'Claim & Withdraw' : 'Claim'
    const callback = !lockHasEnded ? onClaimAndWithdraw : onClaim
    if (!lockHasEnded) {
      if (awaitingClaimConfirmation || awaitingClaimAndWithdrawConfirmation) {
        return (
          <PrimaryButton active>
            Confirming <DotFlashing style={{ marginLeft: '10px' }} />
          </PrimaryButton>
        )
      }
      if (showTransactionPending) {
        return (
          <PrimaryButton active>
            {title}ing <DotFlashing style={{ marginLeft: '10px' }} />
          </PrimaryButton>
        )
      }
      return <PrimaryButton onClick={callback}>{title}</PrimaryButton>
    } else {
    }
  }

  return (
    <Row>
      <Cell>
        <RowCenter>
          <CellAmount>#{bondId}</CellAmount>
          <CellDescription>Bond ID</CellDescription>
        </RowCenter>
      </Cell>
      <Cell>{deusAmount} USDC</Cell>
      <Cell style={{ padding: '5px 10px' }}>
        <CellWrap>
          <CellAmount>{dayjs.utc(lockEnd).format('LLL')}</CellAmount>
          <CellDescription>Expires in {dayjs.utc(lockEnd).fromNow(true)}</CellDescription>
        </CellWrap>
      </Cell>
      <Cell style={{ padding: '5px 10px' }}>150</Cell>
      <Cell style={{ padding: '5px 10px' }}>{getActionButton()}</Cell>
    </Row>
  )
}
