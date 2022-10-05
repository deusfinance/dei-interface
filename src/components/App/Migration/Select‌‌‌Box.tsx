import React from 'react'
import styled from 'styled-components'
import { Currency } from '@sushiswap/core-sdk'
import { isMobile } from 'react-device-detect'

import Box from './Box'
import { USDC_TOKEN } from 'constants/tokens'

const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  overflow: visible;
  margin: 0 auto;
`

const Wrapper = styled(Container)`
  background: ${({ theme }) => theme.bg1};
  border: 1px solid rgb(0, 0, 0);
  /* border-radius: 12px; */
  width: 344px;
  height: 472px;
  border-radius: 12px 0px 0px 12px;
`

const PairsWrapper = styled.div`
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
  border-top-right-radius: 0;
  border-bottom-left-radius: 0;
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

export default function SelectBox({}: {}) {
  const tokens: Currency[][] = [
    [USDC_TOKEN, USDC_TOKEN],
    [USDC_TOKEN, USDC_TOKEN],
  ]
  return (
    <Wrapper>
      <Title>
        <Text>Migrations</Text>
      </Title>
      <PairsWrapper>
        {tokens.map((pair, index) => {
          return (
            <Box
              key={index}
              currencyFrom={pair[0]}
              currencyTo={pair[1]}
              active={index < 1}
              leverage={index < 1 ? 2 : undefined}
            />
          )
        })}
      </PairsWrapper>
    </Wrapper>
  )
}
