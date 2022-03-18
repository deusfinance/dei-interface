import React from 'react'
import styled from 'styled-components'

import Disclaimer from 'components/Disclaimer'
import { Card } from 'components/Card'
import { ArrowBubble } from 'components/Icons'
import InputDeus from 'components/App/Vest/InputDeus'
import { DEUS_TOKEN } from 'constants/vest'
import InputDate from '../../components/App/Vest/InputDate'
import { PrimaryButton } from 'components/Button'
import StaticInfo from 'components/App/Vest/StaticInfo'
import DynamicInfo from 'components/App/Vest/DynamicInfo'

const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  overflow: visible;
  margin: 0 auto;
`

const Wrapper = styled(Container)`
  margin: 0 auto;
  margin-top: 50px;
  width: clamp(250px, 90%, 600px);

  & > * {
    &:nth-child(2) {
      margin-bottom: 25px;
      display: flex;
      flex-flow: row nowrap;
      width: 100%;
      gap: 15px;
      & > * {
        &:last-child {
          max-width: 300px;
        }
      }
    }
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    margin-top: 20px;
  `}
`
const Header = styled.div`
  padding: 20px 10px;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.border2};
  font-weight: 600;
  text-align: center;
  & > * {
    &:first-child {
      position: absolute;
      margin-left: 10px;
      transform: rotate(90deg);
    }
  }
`
const ActionButton = styled(PrimaryButton)`
  margin-top: 15px;
`

export default function Create() {
  return (
    <Container>
      <Wrapper>
        <Card>
          <Header>
            <ArrowBubble size={20}>Back</ArrowBubble>
            <p> Create New Lock</p>
          </Header>
          <InputDeus currency={DEUS_TOKEN} />
          <InputDate />
          <ActionButton>Lock</ActionButton>
          <DynamicInfo />
          <StaticInfo />
        </Card>
      </Wrapper>
      <Disclaimer />
    </Container>
  )
}
