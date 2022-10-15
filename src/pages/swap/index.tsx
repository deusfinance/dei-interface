import React from 'react'
import styled from 'styled-components'

// import { useWalletModalToggle } from 'state/application/hooks'
// import useWeb3React from 'hooks/useWeb3'
// import { useSupportedChainId } from 'hooks/useSupportedChainId'

import Hero from 'components/Hero'
import Disclaimer from 'components/Disclaimer'
import ImageWithFallback from 'components/ImageWithFallback'
import SWAP_ICON from '/public/static/images/pages/ic_swap.svg'
import SwapBox from 'components/App/Swap/SwapBox'
import { RowCenter } from 'components/Row'

const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  overflow: visible;
  margin: 0 auto;
`

const TopWrapper = styled(RowCenter)`
  flex-wrap: wrap;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  margin-top: 20px;
  border-radius: 12px;
  padding: 0;
`

export default function Swap() {
  return (
    <Container>
      <Hero>
        <ImageWithFallback src={SWAP_ICON} width={224} height={133} alt={`Logo`} />
      </Hero>

      <TopWrapper>
        <SwapBox />
      </TopWrapper>

      <Disclaimer />
    </Container>
  )
}
