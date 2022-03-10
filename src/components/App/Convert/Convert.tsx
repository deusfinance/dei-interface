import React, { useState } from 'react'
import styled from 'styled-components'

import { Card } from 'components/Card'
import ConvertToken from './ConvertToken'
import ConvertNFT from './ConvertNFT'

const Wrapper = styled(Card)`
  gap: 20px;
`

const Title = styled.div`
  font-size: 1.1rem;
  & > span {
    font-size: 0.8rem;
  }
`

const Navigation = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  gap: 10px;
  align-items: center;
  font-size: 0.9rem;
`

const NavButton = styled.div<{
  active: boolean
}>`
  padding: 5px;
  padding-bottom: 15px;
  border-bottom: 2px solid ${({ active, theme }) => (active ? theme.border1 : 'transparent')};
  font-weight: bold;
  &:hover {
    cursor: pointer;
  }
`

export enum ConvertAction {
  TOKEN = 'FLUID Token',
  NFT = 'FLUID NFT',
}

export default function Convert() {
  const [selectedAction, setSelectedAction] = useState<ConvertAction>(ConvertAction.TOKEN)
  return (
    <Wrapper>
      <Title>
        Convert & Stake Solidly NFTs/Tokens into SOLID<span>fluid</span>
      </Title>
      <Navigation>
        <NavButton
          active={selectedAction === ConvertAction.TOKEN}
          onClick={() => setSelectedAction(ConvertAction.TOKEN)}
        >
          {ConvertAction.TOKEN}
        </NavButton>
        <NavButton active={selectedAction === ConvertAction.NFT} onClick={() => setSelectedAction(ConvertAction.NFT)}>
          {ConvertAction.NFT}
        </NavButton>
      </Navigation>
      {selectedAction === ConvertAction.TOKEN ? <ConvertToken /> : <ConvertNFT />}
    </Wrapper>
  )
}
