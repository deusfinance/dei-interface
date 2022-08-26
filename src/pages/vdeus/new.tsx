import React, { useState } from 'react'
import styled from 'styled-components'

import Hero, { HeroSubtext } from 'components/Hero'
import Disclaimer from 'components/Disclaimer'
import { Navigation, NavigationTypes } from 'components/NavigationTabs_VDEUS'
import Migrate from 'components/App/ERC20_VDEUS/migrate'
import Stake from 'components/App/ERC20_VDEUS/stake'
import Swap from 'components/App/ERC20_VDEUS/swap'
import Liquidity from 'components/App/ERC20_VDEUS/liquidity'

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

export default function NFT() {
  const [selected, setSelected] = useState<NavigationTypes>(NavigationTypes.MIGRATE)

  const getAppComponent = (): JSX.Element => {
    if (selected == NavigationTypes.MIGRATE) return <Migrate />
    else if (selected == NavigationTypes.SWAP) return <Swap />
    else if (selected == NavigationTypes.STAKE) return <Stake />
    else if (selected == NavigationTypes.LIQUIDITY) return <Liquidity />
    return <Migrate />
  }

  return (
    <Container>
      <Hero>
        <div>vDEUS</div>
        <HeroSubtext>Deposit your voucher and earn</HeroSubtext>
      </Hero>

      <SelectorContainer>
        <Navigation selected={selected} setSelected={setSelected} />
      </SelectorContainer>

      {getAppComponent()}

      <Disclaimer />
    </Container>
  )
}
