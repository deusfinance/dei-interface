import React, { useState, useCallback } from 'react'
import styled from 'styled-components'

import { useCurrenciesFromPool } from 'state/borrow/hooks'
import { BorrowPool } from 'state/borrow/reducer'

import useCurrencyLogo from 'hooks/useCurrencyLogo'
import { useLPData } from 'hooks/useLPData'
import { useReimburseContract } from 'hooks/useContract'
import useWeb3React from 'hooks/useWeb3'
import { useReimburse } from 'hooks/useReimburse'

import { PrimaryButton } from 'components/Button'
import { DualImageWrapper } from 'components/DualImage'
import ImageWithFallback from 'components/ImageWithFallback'
import { DotFlashing } from 'components/Icons'
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

export default function Table({ options }: { options: BorrowPool[] }) {
  return (
    <Wrapper>
      <TableWrapper>
        <Head>
          <tr>
            <Cel>Composition</Cel>
            <Cel>Your Outstanding Debt</Cel>
            <Cel>Your Collateral</Cel>
            <Cel>Your Rewards</Cel>
            <Cel>Claim Rewards</Cel>
          </tr>
        </Head>
        <tbody>{options.length && <TableRow key={0} pool={options[0]} />}</tbody>
      </TableWrapper>
    </Wrapper>
  )
}

function TableRow({ pool }: { pool: BorrowPool }) {
  const { account } = useWeb3React()
  const { borrowCurrency } = useCurrenciesFromPool(pool ?? undefined)
  const logoOne = useCurrencyLogo(pool.token0.address)
  const logoTwo = useCurrencyLogo(pool.token1.address)

  const { userHolder, userCollateral, userRepay } = useReimburse(pool)
  const { balance0, balance1 } = useLPData(pool, userHolder)
  const reimburseContract = useReimburseContract()

  const [awaitingClaimConfirmation, setAwaitingClaimConfirmation] = useState(false)

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
        {formatAmount(parseFloat(balance0))} SOLID <br />
        {formatAmount(parseFloat(balance1))} SEX
      </Cel>
      <Cel style={{ padding: '5px 10px' }}>{getClaimButton()}</Cel>
    </Row>
  )
}
