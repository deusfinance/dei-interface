import React from 'react'
import styled from 'styled-components'

import { RowBetween } from 'components/Row'
import { Loader } from 'components/Icons'
import { formatAmount, formatDollarAmount } from 'utils/numbers'
import { useVestedAPY } from 'hooks/useVested'
import { getMaximumDate } from 'utils/vest'
import { useDeusPrice } from 'hooks/useCoingeckoPrice'

const Wrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  gap: 1rem;
  margin-top: 50px;
`

const InfoWrapper = styled(RowBetween)`
  align-items: center;
  margin-top: 1px;
  height: 30px;
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
`

export default function DeusStats() {
  const { lockedVeDEUS } = useVestedAPY(undefined, getMaximumDate())
  const deusPrice = useDeusPrice()

  return (
    <Wrapper>
      <InfoWrapper>
        <p>DEUS Price</p>
        {deusPrice === null ? <Loader /> : <ItemValue>{formatDollarAmount(parseFloat(deusPrice), 2)}</ItemValue>}
      </InfoWrapper>
      <InfoWrapper>
        <p>Total veDEUS Locked</p>
        {lockedVeDEUS === null ? <Loader /> : <ItemValue>{formatAmount(parseFloat(lockedVeDEUS), 0)}</ItemValue>}
      </InfoWrapper>
    </Wrapper>
  )
}
