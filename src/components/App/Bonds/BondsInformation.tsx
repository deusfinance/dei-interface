import React from 'react'
import styled from 'styled-components'
import { formatAmount } from 'utils/numbers'

const Wrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  width: 100%;
  gap: 0px;
`

const Row = styled.div`
  display: flex;
  flex-flow: row nowrap;
  width: 100%;
  justify-content: space-between;
  font-size: 0.8rem;

  & > * {
    color: ${({ theme }) => theme.text1};
    &:last-child {
      color: ${({ theme }) => theme.text2};
    }
  }
`

export default function BondsInformation({ bondsAPY = '' }: { bondsAPY?: string }) {
  return (
    <Wrapper>
      <Row>
        <div>APY</div>
        <div>{formatAmount(parseFloat(bondsAPY), 0)}%</div>
      </Row>
      <Row>
        <div>Locked until: </div>
        <div>one Year</div>
      </Row>
    </Wrapper>
  )
}
