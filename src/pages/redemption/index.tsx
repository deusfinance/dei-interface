import React, { useState } from 'react'
import styled from 'styled-components'
import { darken } from 'polished'

import Hero, { HeroSubtext } from 'components/Hero'
import Disclaimer from 'components/Disclaimer'
import InputBox from 'components/App/Redemption/InputBox'
import { DEI_ADDRESS, USDC_ADDRESS, DEUS_ADDRESS } from 'constants/addresses'
import { SupportedChainId } from 'constants/chains'
import { useCurrency } from 'hooks/useCurrency'
import { Loader } from 'components/Icons'
import { RowBetween, RowStart } from 'components/Row'
import { CountDown } from 'components/App/Redemption/CountDown'

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
    &:nth-child(2) {
      margin-bottom: 25px;
      display: flex;
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

// const RedemptionInfoWrapper = styled.div`
const RedemptionInfoWrapper = styled(RowBetween)`
  // display: grid;
  // gap: 10px;
  justify-content: center;
  // grid-template-columns: auto auto auto;
  flex-wrap: nowrap;
  overflow: hidden;
  margin-bottom: 10px;
  background: ${({ theme }) => theme.bg1};
  border: 1px solid ${({ theme }) => theme.border1};
  border-radius: 2px;
  padding: 1.5rem 2rem;

  ${({ theme }) => theme.mediaWidth.upToSmall`
  padding: 1rem;
  display: grid;
  row-gap: 20px;
  justify-content: center;
  grid-template-columns: auto;
  `}
`

const InfoRow = styled(RowStart)`
  display: flex;
  flex-flow: row nowrap;
  white-space: nowrap;
`

const ItemValue = styled.div`
  color: ${({ theme }) => theme.yellow3};
  margin-left: 5px;
`

const Description = styled.div`
  font-size: 0.5rem;
  color: ${({ theme }) => darken(0.4, theme.text1)};
`

export default function Claim() {
  // const invalidContext = useInvalidContext()
  const [typedValue, setTypedValue] = useState('')
  // TODO
  const [deusPrice, setDeusPrice] = useState(43)
  const [deusAmount, setDeusAmount] = useState(10)

  const deiCurrency = useCurrency(DEI_ADDRESS[SupportedChainId.FANTOM])
  const usdcCurrency = useCurrency(USDC_ADDRESS[SupportedChainId.FANTOM])
  // TODO: veDeus or deus NFT?
  const deusCurrency = useCurrency(DEUS_ADDRESS[SupportedChainId.FANTOM])

  const redemptionInfo = [
    { label: 'Deus Ratio', value: '9' },
    { label: 'Usdc Ratio', value: '9' },
    { label: 'Remaining Amount', value: '9' },
    { label: 'End Time', value: <CountDown hours={0} minutes={24} seconds={5} /> },
  ]

  return (
    <Container>
      <Hero>
        <div>Redemption</div>
        <HeroSubtext>redeem your dei</HeroSubtext>
      </Hero>
      <Wrapper>
        <RedemptionInfoWrapper>
          {redemptionInfo.map((item, index) => (
            <InfoRow key={index}>
              {item.label}: <ItemValue>{item.value == '0' ? <Loader /> : item.value}</ItemValue>
            </InfoRow>
          ))}
        </RedemptionInfoWrapper>
        <InputBox currency={deiCurrency} value={typedValue} onChange={(value: string) => setTypedValue(value)} />
        <InputBox currency={usdcCurrency} value={typedValue} onChange={(value: string) => setTypedValue(value)} />
        <InputBox currency={deusCurrency} value={typedValue} onChange={(value: string) => setTypedValue(value)} />
        <Description>{`get ${deusAmount} DEUS with ${deusPrice} price.`}</Description>
      </Wrapper>
      <Disclaimer />
    </Container>
  )
}
