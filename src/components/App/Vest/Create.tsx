import React from 'react'
import styled from 'styled-components'

import { Card } from 'components/Card'

const Wrapper = styled(Card)`
  gap: 20px;
`

const Title = styled.div`
  font-size: 1.1rem;
  & > span {
    font-size: 0.8rem;
  }
`

export default function Create() {
  return (
    <Wrapper>
      <Title>
        Convert & Stake Solidly NFTs/Tokens into SOLID<span>fluid</span>
      </Title>
    </Wrapper>
  )
}
