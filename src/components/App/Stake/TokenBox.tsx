import { Token } from '@sushiswap/core-sdk'
import ImageWithFallback from 'components/ImageWithFallback'
import { useCurrencyLogos } from 'hooks/useCurrencyLogo'
import { isMobile } from 'react-device-detect'
import styled from 'styled-components'

const TokenCell = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  gap: 10px;
  flex-basis: 25%;
`

const TokenWrap = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  gap: 10px;
  margin: 0 10px;
`

function getImageSize() {
  return isMobile ? 22 : 30
}

export default function TokenBox({ tokens }: { tokens: Token[] }) {
  const tokensAddress = tokens.map((token) => token.address)
  const logos = useCurrencyLogos(tokensAddress)

  return (
    <TokenCell>
      {tokens.map((token, index) => {
        return (
          <TokenWrap key={index}>
            <ImageWithFallback
              src={logos[index]}
              width={getImageSize()}
              height={getImageSize()}
              alt={`${token?.symbol} Logo`}
              round
            />
            <span>{token.name} </span>
          </TokenWrap>
        )
      })}
    </TokenCell>
  )
}
