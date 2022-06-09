import React from 'react'
import styled from 'styled-components'

import { useRedeemData } from 'hooks/useRedemptionPage'

import { RowBetween, RowEnd, RowStart } from 'components/Row'
import { Loader } from 'components/Icons'
import { formatAmount, formatDollarAmount } from 'utils/numbers'
import { useBonderData, useGetRedeemTime } from 'hooks/useBondsPage'
import { useGlobalDEIBorrowed } from 'hooks/usePoolData'
import { useBorrowPools } from 'state/borrow/hooks'
import { getRemainingTime } from 'utils/time'
import useDebounce from 'hooks/useDebounce'
import { useDeiPrice } from 'hooks/useCoingeckoPrice'
import { useTokenPerBlock } from 'hooks/useBdeiStakingPage'

const Wrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  gap: 1rem;
  margin-top: 50px;
`

const InfoWrapper = styled(RowBetween)`
  align-items: center;
  margin-top: 1px;
  white-space: nowrap;
  margin: auto;
  background-color: #0d0d0d;
  border: 1px solid #1c1c1c;
  border-radius: 15px;
  padding: 1.25rem 2rem;
  font-size: 0.75rem;
  max-width: 500px;
  width: 100%;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    width:90%;
  `}
`

const ItemValue = styled.div`
  color: ${({ theme }) => theme.yellow3};
  margin-left: 5px;

  > span {
    color: ${({ theme }) => theme.text1};
  }
`

const Heading = styled.div`
  display: flex;
  max-width: 500px;
  align-self: center;
  margin-left: 1rem;
  width: 100%;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    width:90%;
  `}
`

const ItemWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  gap: 0.25rem;
`

export default function DeiStats() {
  const deiPrice = useDeiPrice()
  const { redeemTranche, deiBurned } = useRedeemData()

  const { deiBonded } = useBonderData()
  const { totalDeposited } = useTokenPerBlock()

  const pools = useBorrowPools()
  const { borrowedElastic } = useGlobalDEIBorrowed(pools)

  const debouncedAmountIn = useDebounce('', 500)
  const { redeemTime } = useGetRedeemTime(debouncedAmountIn || '0')
  const { day, hours } = getRemainingTime(redeemTime)
  const roundedDays = day + (hours > 12 ? 1 : 0) //adds 1 more day if remained hours is above 12 hours.

  const showLoader = redeemTranche.trancheId == null ? true : false

  return (
    <Wrapper>
      <InfoWrapper>
        <p>DEI Price</p>
        {deiPrice === null ? <Loader /> : <ItemValue>{formatDollarAmount(parseFloat(deiPrice), 2)}</ItemValue>}
      </InfoWrapper>
      <InfoWrapper>
        <p>Global DEI Borrowed</p>
        {borrowedElastic === null ? <Loader /> : <ItemValue>{formatAmount(parseFloat(borrowedElastic))}</ItemValue>}
      </InfoWrapper>
      <Heading>Redemption stats:</Heading>
      <InfoWrapper>
        <p>Total DEI Redeemed</p>
        {showLoader ? <Loader /> : <ItemValue>{formatAmount(deiBurned)}</ItemValue>}
      </InfoWrapper>
      <InfoWrapper>
        <p>Redemption per DEI</p>
        <ItemWrapper>
          <ItemValue>
            ${showLoader ? <Loader /> : redeemTranche.USDRatio}
            <span> in USDC</span>
          </ItemValue>
          <ItemValue>
            ${showLoader ? <Loader /> : redeemTranche.deusRatio}
            <span> in vDEUS</span>
          </ItemValue>
        </ItemWrapper>
      </InfoWrapper>
      <Heading>DEI Bonds stats:</Heading>
      <InfoWrapper>
        <p>Current Bond maturity</p>
        {redeemTime == 0 ? <Loader /> : <ItemValue>~ {roundedDays} days</ItemValue>}
      </InfoWrapper>
      <InfoWrapper>
        <p>Total DEI Bonded</p>
        {deiBonded == 0 ? <Loader /> : <ItemValue>{formatAmount(deiBonded)}</ItemValue>}
      </InfoWrapper>
      <InfoWrapper>
        <p>Total bDEI Staked</p>
        {totalDeposited == 0 ? <Loader /> : <ItemValue>{formatAmount(totalDeposited)}</ItemValue>}
      </InfoWrapper>
    </Wrapper>
  )
}
