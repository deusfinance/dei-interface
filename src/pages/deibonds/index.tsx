import React from 'react'
import styled from 'styled-components'

import Hero from 'components/Hero'
import Disclaimer from 'components/Disclaimer'
import Mint from 'components/App/Bonds/mint'

const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  overflow: visible;
  margin: 0 auto;
`

export default function Bonds() {
  return (
    <Container>
      <Hero>
        <div>DEI Bonds</div>
      </Hero>
      <Mint />
      <Disclaimer />
    </Container>
  )
}
