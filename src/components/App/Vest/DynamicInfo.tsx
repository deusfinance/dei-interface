import React from 'react'
import styled from 'styled-components'
import { RowBetween } from '../../Row/index'

const Wrapper = styled(RowBetween)`
  margin: 15px 0;
`

const VotePower = styled.div`
  text-align: left;
  & > * {
    &:first-child {
      font-size: 0.8rem;
      margin-bottom: 5px;
    }
    &:last-child {
      font-size: 1.2rem;
    }
  }
`
const LockWrap = styled.div`
  text-align: right;
  color: ${({ theme }) => theme.text2};
  font-size: 0.7rem;
`

export default function DynamicInfo() {
  return (
    <Wrapper>
      <VotePower>
        <div>Your voting power will be: </div>
        <div>0 veDEUS</div>
      </VotePower>
      <LockWrap>
        <div>0.00 DEUS locked expires in 7 days</div>
        <div>Locked until 2022/03/25</div>
      </LockWrap>
    </Wrapper>
  )
}
