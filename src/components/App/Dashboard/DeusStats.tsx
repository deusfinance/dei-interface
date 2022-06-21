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
import { useDashboardModalToggle, useVoucherModalToggle } from 'state/application/hooks'
import { ContextError, InvalidContext, useInvalidContext } from 'components/InvalidContext'
import VoucherModal from './VoucherModal'

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
  max-width: 900px;
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

const VoucherWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: space-evenly;
`

export default function DeusStats() {
  const { lockedVeDEUS } = useVestedAPY(undefined, getMaximumDate())
  const deusPrice = useDeusPrice()
  const { numberOfVouchers, listOfVouchers } = useVDeusStats()

  const toggleDashboardModal = useDashboardModalToggle()
  const [currentStat, setCurrentStat] = useState(Dashboard.EMPTY)

  const toggleVoucherModal = useVoucherModalToggle()
  const [currentVoucher, setCurrentVoucher] = useState<number>()

  const invalidContext = useInvalidContext()

  function handleClick(flag: Dashboard) {
    setCurrentStat(flag)
    toggleDashboardModal()
  }

  function handleVoucherClick(flag: number) {
    setCurrentVoucher(flag)
    toggleVoucherModal()
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
        {invalidContext !== ContextError.VALID ? (
          <InvalidContext connectText="Connect your wallet to view your vDEUS vouchers" />
        ) : (
          <Container>
            <Heading>vDEUS stats</Heading>
            <div onClick={() => handleClick(Dashboard.VDEUS_NFTS)}>
              <InfoWrapper>
                <p>Total vDEUS Vouchers</p>
                {numberOfVouchers === null ? <Loader /> : <ItemValue>{numberOfVouchers}</ItemValue>}
              </InfoWrapper>
            </div>
            {listOfVouchers && listOfVouchers.length > 0 && <Heading>Vouchers:</Heading>}
            <VoucherWrapper>
              {listOfVouchers &&
                listOfVouchers.length > 0 &&
                listOfVouchers.map((voucher: number, index) => (
                  <div key={index} onClick={() => handleVoucherClick(voucher)}>
                    <InfoWrapper secondary>
                      <ItemValue style={{ margin: 'auto' }}>vDEUS Voucher #{voucher}</ItemValue>
                    </InfoWrapper>
                  </div>
                ))}
            </VoucherWrapper>
          </Container>
        )}
      </TopWrapper>
      <StatsModal stat={currentStat} />
      <VoucherModal voucherId={currentVoucher} />
    </Wrapper>
  )
}
