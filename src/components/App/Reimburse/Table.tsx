import React, { useMemo, useState, useCallback } from 'react'
import styled from 'styled-components'

import { useCurrenciesFromPool } from 'state/borrow/hooks'
import { BorrowPool } from 'state/borrow/reducer'

import useApproveCallback, { ApprovalState } from 'hooks/useApproveCallback'
import useCurrencyLogo from 'hooks/useCurrencyLogo'
import { useLPData } from 'hooks/useLPData'
import { useReimburseContract } from 'hooks/useContract'
import useWeb3React from 'hooks/useWeb3'
import { useReimburse } from 'hooks/useReimburse'

import PendingRewards from 'constants/sex_solid.json'
import { PrimaryButton } from 'components/Button'
import { DualImageWrapper } from 'components/DualImage'
import ImageWithFallback from 'components/ImageWithFallback'
import { DotFlashing } from 'components/Icons'
import { DEI_TOKEN } from 'constants/borrow'
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
const SmallDescription = styled.p`
  margin-top: 4px;
  font-size: 0.6rem;
  color: ${({ theme }) => theme.text2};
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
export default function Table({ options }: { options: BorrowPool[] }) {
  const [offset, setOffset] = useState(0)

  const paginatedOptions = useMemo(() => {
    return options.slice(offset, offset + itemsPerPage)
  }, [options, offset])

  return (
    <Wrapper>
      <TableWrapper>
        <Head>
          <tr>
            <Cel>Composition</Cel>
            <Cel>Your Outstanding Debt</Cel>
            <Cel>Your Collateral</Cel>
            <Cel>Your Pending Rewards</Cel>
            <Cel>Your Rewards</Cel>
            <Cel>Claim Rewards</Cel>
            <Cel>Withdraw Collateral</Cel>
          </tr>
        </Head>
        <tbody>
          {paginatedOptions.length ? (
            paginatedOptions.map((pool: BorrowPool, index) => <TableRow key={index} pool={pool} />)
          ) : (
            <tr>
              <td colSpan={5} style={{ textAlign: 'center', padding: '20px' }}>
                No Results Found
              </td>
            </tr>
          )}
        </tbody>
      </TableWrapper>
    </Wrapper>
  )
}

function TableRow({ pool }: { pool: BorrowPool }) {
  const { account } = useWeb3React()
  const { borrowCurrency } = useCurrenciesFromPool(pool ?? undefined)
  const logoOne = useCurrencyLogo(pool.token0.address)
  const logoTwo = useCurrencyLogo(pool.token1.address)
  const affectedUser = PendingRewards.filter((user) => user.address === account)

  const { userHolder, userCollateral, userRepay } = useReimburse(pool)
  const { balance0, balance1 } = useLPData(pool, userHolder)
  const reimburseContract = useReimburseContract()

  const [awaitingClaimConfirmation, setAwaitingClaimConfirmation] = useState<boolean>(false)
  const [awaitingRepayBackConfirmation, setAwaitingRepayBackConfirmation] = useState<boolean>(false)
  const [awaitingApproveConfirmation, setAwaitingApproveConfirmation] = useState<boolean>(false)

  const spender = useMemo(() => reimburseContract?.address, [reimburseContract])
  const [approvalState, approveCallback] = useApproveCallback(DEI_TOKEN, spender)

  const [showApprove, showApproveLoader] = useMemo(() => {
    const show = approvalState !== ApprovalState.APPROVED
    return [show, show && approvalState === ApprovalState.PENDING]
  }, [approvalState])

  const handleApprove = async () => {
    setAwaitingApproveConfirmation(true)
    await approveCallback()
    setAwaitingApproveConfirmation(false)
  }

  function getApproveButton(): JSX.Element | null {
    if (!account) {
      return null
    }

    if (awaitingApproveConfirmation) {
      return (
        <PrimaryButton active>
          Awaiting <DotFlashing style={{ marginLeft: '10px' }} />
        </PrimaryButton>
      )
    }
    if (showApproveLoader) {
      return (
        <PrimaryButton active>
          Approving <DotFlashing style={{ marginLeft: '10px' }} />
        </PrimaryButton>
      )
    }

    if (showApprove) {
      return <PrimaryButton onClick={handleApprove}>Approve DEI</PrimaryButton>
    }
    return null
  }

  const onClaim = useCallback(async () => {
    try {
      if (!reimburseContract || !account) return
      setAwaitingClaimConfirmation(true)
      await reimburseContract.claimAndWithdraw([pool.lpPool], account)
      setAwaitingClaimConfirmation(false)
    } catch (err) {
      console.error(err)
      setAwaitingClaimConfirmation(false)
    }
  }, [reimburseContract, pool, account])

  const onRepayBack = useCallback(async () => {
    try {
      if (!reimburseContract || !account) return
      setAwaitingRepayBackConfirmation(true)
      await reimburseContract.deiToCollateral(account)
      setAwaitingRepayBackConfirmation(false)
    } catch (err) {
      console.error(err)
      setAwaitingRepayBackConfirmation(false)
    }
  }, [reimburseContract, account])

  function getClaimButton() {
    if (awaitingClaimConfirmation) {
      return (
        <PrimaryButton active>
          Awaiting <DotFlashing style={{ marginLeft: '10px' }} />
        </PrimaryButton>
      )
    }
    return <PrimaryButton onClick={onClaim}>Claim</PrimaryButton>
  }

  function getRepayBackButton() {
    if (!!getApproveButton()) {
      return null
    }
    if (awaitingRepayBackConfirmation) {
      return (
        <PrimaryButton active>
          Awaiting <DotFlashing style={{ marginLeft: '10px' }} />
        </PrimaryButton>
      )
    }
    return <PrimaryButton onClick={onRepayBack}>Repay & Withdraw </PrimaryButton>
  }

  return (
    <Row>
      <Cel>
        <DualImageWrapper>
          <ImageWithFallback src={logoOne} alt={`${pool.token0.symbol} logo`} width={30} height={30} />
          <ImageWithFallback src={logoTwo} alt={`${pool.token1.symbol} logo`} width={30} height={30} />
          {pool.composition}
        </DualImageWrapper>
      </Cel>
      <Cel>
        {formatAmount(parseFloat(userRepay), 4)} {borrowCurrency?.symbol}
      </Cel>
      <Cel>{formatAmount(parseFloat(userCollateral), 5)}</Cel>
      <Cel>
        {affectedUser.length ? formatAmount(affectedUser[0].solid) : 0} SOLID <br />
        {affectedUser.length ? formatAmount(affectedUser[0].sex) : 0} SEX <br />
        <SmallDescription>(claimable in 24h)</SmallDescription>
      </Cel>
      <Cel>
        {formatAmount(parseFloat(balance0))} SOLID <br />
        {formatAmount(parseFloat(balance1))} SEX
      </Cel>
      <Cel style={{ padding: '5px 10px' }}>{getClaimButton()}</Cel>
      <Cel style={{ padding: '5px 10px' }}>
        {getApproveButton()}
        {getRepayBackButton()}
      </Cel>
    </Row>
  )
}
