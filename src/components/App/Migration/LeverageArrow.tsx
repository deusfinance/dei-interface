import React from 'react'
import styled from 'styled-components'

import { Row } from 'components/Row'
import { ArrowRight, ArrowDown } from 'react-feather'

const Container = styled.div`
  width: 60px;
  height: 28px;
  padding: 1px;
  border-radius: 4px;
  background: ${({ theme }) => theme.deiColor};
`

const Wrapper = styled(Row)`
  width: 100%;
  height: 100%;
  padding: 0px 4px;
  white-space: nowrap;
  border-radius: 4px;
  color: ${({ theme }) => theme.text2};
  background: ${({ theme }) => theme.black};
`

const Leverage = styled.span`
  background: ${({ theme }) => theme.deiColor};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`

export default function LeverageArrow({ leverage, arrowDirection }: { leverage: number; arrowDirection: string }) {
  return (
    <Container>
      <Wrapper>
        <Leverage>{`1:${leverage}`}</Leverage>

        {arrowDirection === 'down' ? (
          <ArrowDown style={{ color: '#EBEBEC', minWidth: '24px' }} />
        ) : (
          <ArrowRight style={{ color: '#EBEBEC', minWidth: '24px' }} />
        )}
      </Wrapper>
    </Container>
  )
}
