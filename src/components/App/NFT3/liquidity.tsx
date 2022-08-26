import React from 'react'
import styled from 'styled-components'

import LiquidityPool from './liquidityPool'
import StakingPool from './stakingPool'

const TopWrapper = styled.div`
  display: flex;
  align-items: flex-start;
  margin: auto;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    min-width: 460px;
    flex-direction: column;
  `}
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    min-width: 340px;
  `}
`

export default function Liquidity() {
  return (
    <TopWrapper>
      <LiquidityPool />
      <StakingPool />
    </TopWrapper>
  )
}
