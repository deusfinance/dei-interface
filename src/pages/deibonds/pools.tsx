import React, { useState } from 'react'
import styled from 'styled-components'

import Hero from 'components/Hero'
import Disclaimer from 'components/Disclaimer'
import { BDEI_TOKEN } from 'constants/tokens'
import Navigation, { NavigationTypes } from 'components/App/Stake/Navigation'
import { StablePools } from 'constants/sPools'
import Staking from 'components/App/deiPool/Staking'

const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  overflow: visible;
  margin: 0 auto;
`

const SelectorContainer = styled.div`
  display: flex;
  flex-flow: column nowrap;
  overflow: visible;
  margin: 0 auto;
  margin-top: 24px;
  padding-right: 24px;
`

export default function Pools() {
  const bdeiCurrency = BDEI_TOKEN
  const pool = StablePools[0]
  const lpCurrency = pool.lpToken

  const [selected, setSelected] = useState<NavigationTypes>(NavigationTypes.STAKE)

  const getAppComponent = (): JSX.Element => {
    if (selected == NavigationTypes.STAKE) {
      return (
        <>
          <Staking type={'stake'} pid={0} currency={bdeiCurrency}></Staking>
          <Staking type={'stake'} pid={1} currency={lpCurrency}></Staking>
        </>
      )
    } else {
      return (
        <>
          <Staking type={'unstake'} pid={0} currency={bdeiCurrency}></Staking>
          <Staking type={'unstake'} pid={1} currency={lpCurrency}></Staking>
        </>
      )
    }
  }

  return (
    <Container>
      <Hero>
        <div>Pools</div>
      </Hero>
      <SelectorContainer>
        <Navigation selected={selected} setSelected={setSelected} />
      </SelectorContainer>

      {getAppComponent()}
      <Disclaimer />
    </Container>
  )
}
