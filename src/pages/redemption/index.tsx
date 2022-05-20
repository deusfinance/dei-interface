import React, { useState } from 'react'
import styled from 'styled-components'

import Hero, { HeroSubtext } from 'components/Hero'
import Disclaimer from 'components/Disclaimer'
import InputBox from 'components/App/Vest/InputBox'
import { DEUS_ADDRESS, DEI_ADDRESS, USDC_ADDRESS } from 'constants/addresses'
import { SupportedChainId } from 'constants/chains'
import { useCurrency } from 'hooks/useCurrency'

const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  overflow: visible;
  margin: 0 auto;
`

const Wrapper = styled(Container)`
  margin: 0 auto;
  margin-top: 50px;
  width: clamp(250px, 90%, 1200px);

  & > * {
    &:nth-child(1) {
      margin-bottom: 25px;
      display: flex;
      flex-flow: row nowrap;
      width: 100%;
      gap: 15px;
      & > * {
        &:last-child {
          max-width: 300px;
        }
      }
    }
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    margin-top: 20px;
  `}
`

export default function Claim() {
  // const invalidContext = useInvalidContext()
  const [typedValue, setTypedValue] = useState('')

  const deiCurrency = useCurrency(DEI_ADDRESS[SupportedChainId.FANTOM])
  const usdcCurrency = useCurrency(USDC_ADDRESS[SupportedChainId.FANTOM])
  const deusCurrency = useCurrency(DEUS_ADDRESS[SupportedChainId.FANTOM])

  return (
    <Container>
      <Hero>
        <div>Redemption</div>
        <HeroSubtext>redeem your dei</HeroSubtext>
      </Hero>
      <Wrapper>
        <InputBox currency={deiCurrency} value={typedValue} onChange={(value: string) => setTypedValue(value)} />
        <InputBox currency={usdcCurrency} value={typedValue} onChange={(value: string) => setTypedValue(value)} />
        <InputBox currency={deusCurrency} value={typedValue} onChange={(value: string) => setTypedValue(value)} />
      </Wrapper>
      <Disclaimer />
    </Container>
  )
}
