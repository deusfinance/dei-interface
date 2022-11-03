import React from 'react'
import styled from 'styled-components'
import { isMobile } from 'react-device-detect'

import Box from './Box'
import { MigrationStates } from 'constants/migration'

export const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  overflow: visible;
  margin: 0 auto;
`

const Wrapper = styled(Container)`
  background: ${({ theme }) => theme.bg1};
  border: 1px solid rgb(0, 0, 0);
  border-radius: 12px 0px 0px 12px;
  width: 344px;
  height: 460px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    border-radius: 12px;
  `}
`

const PairsWrapper = styled.div`
  overflow: scroll;
  & > * {
    margin: 16px auto;
  }
`

const Title = styled.div`
  width: 100%;
  height: 60px;
  color: ${({ theme }) => theme.text1};
  background: ${({ theme }) => theme.bg1};
  text-align: center;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    border-radius: 12px;
  `}
`

const Text = styled.p`
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  display: inline-block;
  vertical-align: middle;
  margin: 20px 0px;
`

export const getImageSize = () => {
  return isMobile ? 35 : 38
}

export default function SelectBox({
  activeState,
  onTokenSelect,
}: {
  activeState: number
  onTokenSelect: (value: number) => void
}) {
  return (
    <Wrapper>
      <Title>
        <Text>Migrations</Text>
      </Title>
      <PairsWrapper>
        {MigrationStates.map((migrationState, index) => {
          const { inputToken, outputToken, leverage } = migrationState
          return (
            <Box
              key={index}
              index={index}
              currencyFrom={inputToken}
              currencyTo={outputToken}
              active={activeState === index}
              leverage={leverage}
              onTokenSelect={(value: number) => onTokenSelect(value)}
            />
          )
        })}
      </PairsWrapper>
    </Wrapper>
  )
}
