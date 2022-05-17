import React, { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import utc from 'dayjs/plugin/utc'

import { useBondsContract } from 'hooks/useContract'
import { useIsTransactionPending, useTransactionAdder } from 'state/transactions/hooks'
import { formatAmount } from 'utils/numbers'

import Pagination from 'components/Pagination'
import Column from 'components/Column'
import { PrimaryButton } from 'components/Button'
import { DotFlashing } from 'components/Icons'
import { BondType } from 'hooks/useOwnedBonds'

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
    :nth-child(2),
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
export default function Table({ bonds, rewards }: { bonds: BondType[]; rewards: number[] }) {
  const [offset, setOffset] = useState(0)

  const paginatedItems = useMemo(() => {
    return bonds.slice(offset, offset + itemsPerPage)
  }, [bonds, offset])

  const pageCount = useMemo(() => {
    return Math.ceil(bonds.length / itemsPerPage)
  }, [bonds])

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
              <Cell>APY</Cell>
              <Cell>Reward</Cell>
              <Cell>Action</Cell>
            </tr>
          </Head>
          <tbody>
            {paginatedItems.length > 0 &&
              paginatedItems.map((bond: BondType, index) => (
                <TableRow key={index} bond={bond} reward={rewards[index]} />
              ))}
          </tbody>
        </TableWrapper>
        {paginatedItems.length == 0 && <NoResults>No Bonds Found</NoResults>}
        {paginatedItems.length > 0 && <Pagination pageCount={pageCount} onPageChange={onPageChange} />}
      </Wrapper>
    </>
  )
}

function TableRow({ bond, reward }: { bond: BondType; reward: number }) {
  const [awaitingClaimConfirmation, setAwaitingClaimConfirmation] = useState(false)
  const [awaitingClaimAndExitConfirmation, setAwaitingClaimExitConfirmation] = useState(false)
  const [pendingTxHash, setPendingTxHash] = useState('')
  const bondsContract = useBondsContract()
  const addTransaction = useTransactionAdder()
  const { id: bondId, endTime, apy } = bond
  const showTransactionPending = useIsTransactionPending(pendingTxHash)
  const lockHasEnded = useMemo(() => dayjs.utc(endTime).isBefore(dayjs.utc().subtract(10, 'seconds')), [endTime]) // subtracting 10 seconds to mitigate this from being true on page load

  const onClaimAndExit = useCallback(async () => {
    try {
      if (!bondsContract) return
      setAwaitingClaimExitConfirmation(true)
      const response = await bondsContract.exit(bondId)
      addTransaction(response, {
        summary: `Claim Reward And Exit #${bondId} from Bonds`,
        vest: { hash: response.hash },
      })
      setPendingTxHash(response.hash)
      setAwaitingClaimExitConfirmation(false)
    } catch (err) {
      console.error(err)
      setAwaitingClaimExitConfirmation(false)
      setPendingTxHash('')
    }
  }, [bondsContract, bondId, addTransaction])

  const onClaim = useCallback(async () => {
    try {
      if (!bondsContract) return
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
  }, [bondsContract, bondId, addTransaction])

  function getActionButton() {
    const title = lockHasEnded ? 'Claim & Exit' : 'Claim'
    const callback = lockHasEnded ? onClaimAndExit : reward > 0 ? onClaim : undefined
    if (awaitingClaimConfirmation || awaitingClaimAndExitConfirmation) {
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
    return (
      <PrimaryButton onClick={callback} disabled={!lockHasEnded && reward == 0}>
        {title}
      </PrimaryButton>
    )
  }

  return (
    <Row>
      <Cell>
        <CellWrap>
          <CellAmount>#{bondId}</CellAmount>
          <CellDescription>Bond Id</CellDescription>
        </CellWrap>
      </Cell>
      <Cell>{bond.amount} USDC</Cell>
      <Cell style={{ padding: '5px 10px' }}>
        <CellWrap>
          <CellAmount>{dayjs.utc(endTime).format('LL')}</CellAmount>
          <CellDescription>Expires in {dayjs.utc(endTime).fromNow(true)}</CellDescription>
        </CellWrap>
      </Cell>
      <Cell style={{ padding: '5px 10px' }}>{apy}%</Cell>
      <Cell style={{ padding: '5px 10px' }}>{formatAmount(reward)} DEUS</Cell>
      <Cell style={{ padding: '5px 10px' }}>{getActionButton()}</Cell>
    </Row>
  )
}
