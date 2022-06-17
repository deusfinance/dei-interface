import React, { useState } from 'react'
import styled from 'styled-components'

import { RowBetween } from 'components/Row'
import { Loader } from 'components/Icons'
import { formatAmount, formatDollarAmount } from 'utils/numbers'
import { useVestedAPY } from 'hooks/useVested'
import { getMaximumDate } from 'utils/vest'
import { useDeusPrice } from 'hooks/useCoingeckoPrice'
import { useVDeusStats } from 'hooks/useVDeusStats'
import StatsModal from './StatsModal'
import { Dashboard } from './DeiStats'
import { useDashboardModalToggle } from 'state/application/hooks'

const Wrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  gap: 1rem;
  margin-top: 50px;
  min-width: 750px;
  align-self: center;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    min-width: 0;
    width: 100%;
  `}
`

const TopWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  width: 100%;
  max-width: 1200px;
  gap: 2rem;
  justify-content: start;
  margin: 0 auto;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    flex-flow: column nowrap;
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

  &:hover {
    background: #141414;
    cursor: pointer;
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 0.75rem 1rem;
    width: 90%;
    min-width: 250px;
  `}

  ${({ secondary }) =>
    secondary &&
    `
    min-width: 250px;
  `}
`

const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  align-self: start;
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
    gap: 0.5rem;
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
  align-self: center;
  margin-left: 1rem;
  width: 100%;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    width:90%;
  `}
`

export default function DeusStats() {
  const { lockedVeDEUS } = useVestedAPY(undefined, getMaximumDate())
  const deusPrice = useDeusPrice()
  const { numberOfVouchers } = useVDeusStats()

  const toggleDashboardModal = useDashboardModalToggle()
  const [currentStat, setCurrentStat] = useState(Dashboard.EMPTY)

  function handleClick(flag: Dashboard) {
    setCurrentStat(flag)
    toggleDashboardModal()
  }

  return (
    <Wrapper>
      <TopWrapper>
        <Container>
          <Heading>DEUS stats</Heading>
          <div onClick={() => handleClick(Dashboard.DEUS_PRICE)}>
            <InfoWrapper>
              <p>DEUS Price</p>
              {deusPrice === null ? <Loader /> : <ItemValue>{formatDollarAmount(parseFloat(deusPrice), 2)}</ItemValue>}
            </InfoWrapper>
          </div>
          <div onClick={() => handleClick(Dashboard.VE_DEUS_LOCKED)}>
            <InfoWrapper>
              <p>Total veDEUS Locked</p>
              {lockedVeDEUS === null ? <Loader /> : <ItemValue>{formatAmount(parseFloat(lockedVeDEUS), 0)}</ItemValue>}
            </InfoWrapper>
          </div>
        </Container>
        <Container>
          <Heading>vDEUS stats</Heading>
          <div onClick={() => handleClick(Dashboard.VDEUS_NFTS)}>
            <InfoWrapper>
              <p>Total vDEUS Vouchers</p>
              {numberOfVouchers === null ? <Loader /> : <ItemValue>{numberOfVouchers}</ItemValue>}
            </InfoWrapper>
          </div>
        </Container>
      </TopWrapper>
      <StatsModal currentStat={currentStat} />
    </Wrapper>
  )
}
