import React from 'react'
import styled from 'styled-components'

import Hero from 'components/Hero'
import Disclaimer from 'components/Disclaimer'
import { StakingPools } from 'constants/stakings'
import GeneralStaking from 'components/App/VDEUS_ERC20/GeneralStaking'
// import Staking from 'components/App/deiPool/Staking'

const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  overflow: visible;
  margin: 0 auto;
`

export default function Pools() {
  return (
    <Container>
      <Hero>
        <div>Pools</div>
      </Hero>
      <GeneralStaking stakingPool={StakingPools[0]} />
      {/* <Staking stakingPool={StakingPools[0]} /> */}
      <Disclaimer />
    </Container>
  )
}
