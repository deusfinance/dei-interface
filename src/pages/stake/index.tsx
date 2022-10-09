import React from 'react'
import styled from 'styled-components'

// import { useWalletModalToggle } from 'state/application/hooks'
// import useWeb3React from 'hooks/useWeb3'
// import { useSupportedChainId } from 'hooks/useSupportedChainId'

import Hero from 'components/Hero'
import Disclaimer from 'components/Disclaimer'
import ImageWithFallback from 'components/ImageWithFallback'
import STAKE_ICON from '/public/static/images/pages/ic_stake.svg'
import { RowCenter } from 'components/Row'

const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  overflow: visible;
  margin: 0 auto;
`

export const Wrapper = styled(Container)`
  flex-flow: row wrap;
  margin-top: 20px;
  background: ${({ theme }) => theme.bg1};
  border: 1px solid rgb(0, 0, 0);
  width: 344px;
  height: 472px;
  border-radius: 12px 0px 0px 12px;
`

const TopWrapper = styled(RowCenter)`
  flex-wrap: wrap;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  margin-top: 20px;
`

const StakeBox = styled.div`
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.bg1};
  border-radius: 12px;
  width: 100%;
  overflow: scroll;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    width: 100%;
    margin: 0 auto;
  `}
`

export default function Stake() {
  // const { chainId, account } = useWeb3React()
  // const toggleWalletModal = useWalletModalToggle()
  // const isSupportedChainId = useSupportedChainId()

  return (
    <Container>
      <Hero>
        <ImageWithFallback src={STAKE_ICON} width={224} height={133} alt={`Logo`} />
      </Hero>

      <TopWrapper>
        <StakeBox>Hi</StakeBox>
      </TopWrapper>

      <Disclaimer />
    </Container>
  )
}
