import React from 'react'
import styled from 'styled-components'
import { Currency } from '@sushiswap/core-sdk'
import { isMobile } from 'react-device-detect'

import { Row } from 'components/Row'
import Box from './Box'
import { USDC_TOKEN } from 'constants/tokens'

export const Wrapper = styled(Row)`
  background: ${({ theme }) => theme.bg2};
  border-radius: 12px;
  color: ${({ theme }) => theme.text2};
  white-space: nowrap;
  height: 80px;
  border: 1px solid #444444;
  border-color: ${({ theme }) => theme.border1};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    height: 65px;
  `}
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
    <>
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
      {/* <Box currencyFrom={USDC_TOKEN} currencyTo={USDC_TOKEN} active={false} /> */}
    </>
  )
}
