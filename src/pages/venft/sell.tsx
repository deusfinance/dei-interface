import React from 'react'

import Hero, { HeroSubtext } from 'components/Hero'
import Disclaimer from 'components/Disclaimer'
import { SearchField, useSearch } from 'components/App/Borrow'
import { Container, TableSell, Wrapper } from 'components/App/Venft'
import { useVenftTokens } from 'hooks/useVenft'

export default function Sell() {
  const { searchProps } = useSearch()
  const { veNFTTokens } = useVenftTokens()
  return (
    <Container>
      <Hero>
        <div>SELL veNFT</div>
        <HeroSubtext>Sell veNFT</HeroSubtext>
      </Hero>
      <Wrapper>
        <div>
          <SearchField searchProps={searchProps} />
        </div>
        <TableSell veNFTTokens={veNFTTokens} />
      </Wrapper>
      <Disclaimer />
    </Container>
  )
}
