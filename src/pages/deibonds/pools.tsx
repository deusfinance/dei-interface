import React, { useState } from 'react'
import styled from 'styled-components'

import Hero from 'components/Hero'
import Disclaimer from 'components/Disclaimer'
import { BDEI_TOKEN } from 'constants/tokens'
import { StablePools } from 'constants/sPools'
import { StakingPools } from 'constants/stakings'
import Staking from 'components/App/deiPool/Staking'

const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  overflow: visible;
  margin: 0 auto;
`

export default function Pools() {
  const bdeiCurrency = BDEI_TOKEN
  const pool = StablePools[0]
  const lpCurrency = pool.lpToken

  return (
    <Container>
      <Hero>
        <div>Pools</div>
      </Hero>
      {StakingPools.map((pool) => {
        return <Staking pool={pool} />
      })}
      <Disclaimer />
    </Container>
  )
}
