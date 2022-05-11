import React from 'react'

import Hero, { HeroSubtext } from 'components/Hero'
import Disclaimer from 'components/Disclaimer'
import { Container, SearchField, TableDeposit, useSearch, Wrapper } from 'components/App/Venft'
import { useVeNFTTokens } from 'hooks/useVeNFT'
import styled from 'styled-components'

const ModalWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
`

const MainWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  gap: 0.5rem;
  padding: 1.5rem 1.25rem;
  overflow: visible;
`

const BottomWrapper = styled(MainWrapper)`
  gap: 0.5rem;
`

const ModalMessage = styled.div`
  display: block;
  align-text: center;
  text-align: center;
  font-size: 0.9rem;
  border-radius: 5px;
  padding: 0.7rem;
`
export default function Deposit() {
  const { searchProps } = useSearch()
  const { veNFTTokens } = useVeNFTTokens()

  return (
    <Container data-testid="venft-deposit-page">
      <Hero>
        <div>SELL veNFT</div>
        <HeroSubtext>Sell veNFT</HeroSubtext>
      </Hero>
      <Wrapper>
        <div>
          <SearchField searchProps={searchProps} />
        </div>
        <TableDeposit veNFTTokens={veNFTTokens} />
      </Wrapper>
      <Disclaimer />
    </Container>
  )
}
