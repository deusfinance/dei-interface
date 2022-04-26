import React from 'react'

import Hero, { HeroSubtext } from 'components/Hero'
import Disclaimer from 'components/Disclaimer'
import { SearchField, useSearch } from 'components/App/Borrow'
import { Container, TableSell, Wrapper } from 'components/App/Venft'

export default function Buy() {
  const { searchProps } = useSearch()

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
        <TableSell />
      </Wrapper>
      <Disclaimer />
    </Container>
  )
}
