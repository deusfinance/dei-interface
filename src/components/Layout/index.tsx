import React from 'react'
import styled from 'styled-components'

import NavBar from './NavBar'
import { useInjectedAddress } from 'hooks/useInjectedAddress'
import Warning from './Warning'

const Wrapper = styled.div`
  display: flex;
  height: 100%;
  flex-flow: column nowrap;
`

// Scroll content so we can use a semi transparent navbar.
const Content = styled.div`
  display: block;
  position: relative;
  height: calc(100vh - 55px);
  overflow: scroll;
  padding-bottom: 20px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding-bottom: 40px;
  `}
`

export default function Layout({ children }: { children: React.ReactNode }) {
  const TestMode = useInjectedAddress()
  return (
    <Wrapper>
      <NavBar />
      {TestMode && <Warning message={`❌ Your mode is "READ-ONLY" .Please dont confirm any transactions! ❌ `} />}
      <Content>{children}</Content>
    </Wrapper>
  )
}
