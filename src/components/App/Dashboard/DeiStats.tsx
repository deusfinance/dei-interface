import React, { useMemo } from 'react'
import styled from 'styled-components'

import { useRedeemData } from 'hooks/useRedemptionPage'

import { RowBetween } from 'components/Row'
import { Loader } from 'components/Icons'
import { formatAmount, formatDollarAmount } from 'utils/numbers'
import { useBonderData, useGetRedeemTime } from 'hooks/useBondsPage'
import { useGlobalDEIBorrowed } from 'hooks/usePoolData'
import { useBorrowPools } from 'state/borrow/hooks'
import { getRemainingTime } from 'utils/time'
import useDebounce from 'hooks/useDebounce'
import { useDeiPrice } from 'hooks/useCoingeckoPrice'
import { useTokenPerBlock } from 'hooks/useBdeiStakingPage'
import { useDeiStats } from 'hooks/useDeiStats'
import { StakingPools } from 'constants/stakings'
import { useGetApy } from 'hooks/useStakingInfo'

const Wrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  gap: 1rem;
  margin-top: 50px;
`

const TopWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  width: 100%;
  max-width: 1200px;
  gap: 2rem;
  justify-content: start;
  margin: 0 auto;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    flex-flow: column nowrap;
  `}
`

const StatsWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  gap: 2rem;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    width: 100%;
    margin: 0 auto;
  `}
`

const InfoWrapper = styled(RowBetween)<{
  secondary?: boolean
}>`
  align-items: center;
  margin-top: 1px;
  white-space: nowrap;
  margin: auto;
  background-color: #0d0d0d;
  border: 1px solid #1c1c1c;
  border-radius: 15px;
  padding: 1.25rem 2rem;
  font-size: 0.75rem;
  min-width: 500px;
  width: 100%;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 1.25rem 1rem;
    width: 90%;
    min-width: 265px;
  `}

  ${({ secondary }) =>
    secondary &&
    `
    min-width: 265px;
  `}
`

const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  align-self: center;
  background-color: #2f2f2f;
  border: 1px solid #0d0d0d;
  border-radius: 15px;
  padding: 1.25rem 1rem;
  font-size: 1rem;
  min-width: 500px;
  width: 100%;
  gap: 1rem;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    width: 90%;
    padding: 0.75rem 0.5rem;
    margin: 0 auto;
    min-width: 265px;
  `}
`

const ItemValue = styled.div`
  display: flex;
  align-self: end;
  color: ${({ theme }) => theme.yellow3};
  margin-left: 5px;

  > span {
    margin-left: 5px;
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

const SubWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  gap: 0.5rem;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    flex-flow: column nowrap;
  `}
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

  const { pid } = StakingPools[0] //bDEI single staking pool
  const bDeiSingleStakingAPR = useGetApy(pid)

  const { totalSupply, totalProtocolHoldings, circulatingSupply, totalUSDCReserves } = useDeiStats()

  const usdcBackingPerDei = useMemo(() => {
    return totalUSDCReserves / circulatingSupply
  }, [totalUSDCReserves, circulatingSupply])

  const showLoader = redeemTranche.trancheId == null ? true : false

  return (
    <Wrapper>
      <TopWrapper>
        <Container>
          <Heading>DEI stats</Heading>
          <InfoWrapper>
            <p>Price</p>
            {deiPrice === null ? <Loader /> : <ItemValue>{formatDollarAmount(parseFloat(deiPrice), 2)}</ItemValue>}
          </InfoWrapper>
          <Container>
            <InfoWrapper>
              <p>Total Supply</p>
              {totalSupply === null ? <Loader /> : <ItemValue>{formatAmount(totalSupply, 2)}</ItemValue>}
            </InfoWrapper>
            <SubWrapper>
              <InfoWrapper secondary={true}>
                <p>Protocol Holdings</p>
                {totalProtocolHoldings === null ? (
                  <Loader />
                ) : (
                  <ItemValue>{formatAmount(totalProtocolHoldings, 2)}</ItemValue>
                )}
              </InfoWrapper>
              <InfoWrapper secondary={true}>
                <p>Total DEI Bonded</p>
                {deiBonded == 0 ? <Loader /> : <ItemValue>{formatAmount(deiBonded)}</ItemValue>}
              </InfoWrapper>
            </SubWrapper>
            <InfoWrapper>
              <p>Circulating Supply</p>
              {circulatingSupply === null ? <Loader /> : <ItemValue>{formatAmount(circulatingSupply, 2)}</ItemValue>}
            </InfoWrapper>
          </Container>
          <InfoWrapper>
            <p>Total USDC Reserves</p>
            {totalUSDCReserves === null ? <Loader /> : <ItemValue>{formatAmount(totalUSDCReserves, 2)}</ItemValue>}
          </InfoWrapper>
          <InfoWrapper>
            <p>USDC Backing per DEI</p>
            {usdcBackingPerDei === null ? (
              <Loader />
            ) : (
              <ItemValue>{formatDollarAmount(usdcBackingPerDei, 2)}</ItemValue>
            )}
          </InfoWrapper>
          <InfoWrapper>
            <p>Global DEI Borrowed</p>
            {borrowedElastic === null ? <Loader /> : <ItemValue>{formatAmount(parseFloat(borrowedElastic))}</ItemValue>}
          </InfoWrapper>
        </Container>
        <StatsWrapper>
          <Container>
            <Heading>Redemption stats</Heading>
            <InfoWrapper>
              <p>Total DEI Redeemed</p>
              {showLoader ? <Loader /> : <ItemValue>{formatAmount(deiBurned)}</ItemValue>}
            </InfoWrapper>
            <InfoWrapper>
              <p>Redemption per DEI</p>
              <ItemWrapper>
                <ItemValue>
                  ${showLoader ? <Loader /> : redeemTranche.USDRatio}
                  <span>in USDC</span>
                </ItemValue>
                <ItemValue>
                  ${showLoader ? <Loader /> : redeemTranche.deusRatio}
                  <span>in vDEUS</span>
                </ItemValue>
              </ItemWrapper>
            </InfoWrapper>
          </Container>
          <Container>
            <Heading>DEI Bonds stats</Heading>
            <InfoWrapper>
              <p>Total DEI Bonded</p>
              {deiBonded == 0 ? <Loader /> : <ItemValue>{formatAmount(deiBonded)}</ItemValue>}
            </InfoWrapper>
            <InfoWrapper>
              <p>Total bDEI Staked</p>
              {totalDeposited == 0 ? <Loader /> : <ItemValue>{formatAmount(totalDeposited)}</ItemValue>}
            </InfoWrapper>
            <InfoWrapper>
              <p>bDEI Staking APR</p>
              {bDeiSingleStakingAPR == 0 ? <Loader /> : <ItemValue>{bDeiSingleStakingAPR.toFixed(2)}%</ItemValue>}
            </InfoWrapper>
            <InfoWrapper>
              <p>Current Bond maturity</p>
              {redeemTime == 0 ? <Loader /> : <ItemValue>~ {roundedDays} days</ItemValue>}
            </InfoWrapper>
          </Container>
        </StatsWrapper>
      </TopWrapper>
    </Wrapper>
  )
}
