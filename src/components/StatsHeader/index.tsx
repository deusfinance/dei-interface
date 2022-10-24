import React from 'react'
import styled from 'styled-components'
import { Token } from '@sushiswap/core-sdk'
import { isMobile } from 'react-device-detect'

import Dropdown from 'components/DropDown'
import ImageWithFallback from 'components/ImageWithFallback'

import { Stakings } from 'constants/stakingPools'
import { useCurrencyLogos } from 'hooks/useCurrencyLogo'

const Wrapper = styled.div`
  width: 100%;
  overflow-x: auto;
  white-space: nowrap;
  -webkit-overflow-scrolling: touch;
  display: flex;
  justify-content: center;
  background: ${({ theme }) => theme.bg0};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    justify-content: stretch;
  `};
`

const Item = styled.div<{ rightBorder?: boolean }>`
  display: flex;
  align-items: center;
  padding: 0 50px;
  /* border-left: ${({ theme }) => `1px solid ${theme.border1}`}; */
`

const DropDownItem = styled(Item)`
  padding: 0px 0px;
`

const ItemBox = styled.div`
  display: inline-block;
  padding: 8px 10px;
  margin: 0 24px;
`

const MultipleImageWrapper = styled.div`
  display: flex;
  margin: 8px 8px 8px 12px;

  & > * {
    &:nth-child(2) {
      transform: translateX(-30%);
      margin-right: -9px;
    }
    &:nth-child(3) {
      transform: translateX(-60%);
      margin-right: -9px;
    }
    &:nth-child(4) {
      transform: translateX(-90%);
      margin-right: -9px;
    }
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    & > * {
      width: 28px;
      height: 28px;
    }
`}
`

const SingleImageWrapper = styled.div`
  min-width: 22px;
  margin: 8px 8px 8px 12px;
`

const Name = styled.div`
  font-size: 15px;
  color: ${({ theme }) => theme.text2};
`

const Value = styled.div<{ NudeColor?: boolean }>`
  font-weight: 500;
  font-size: 15px;
  color: ${({ theme, NudeColor }) => (NudeColor ? theme.nude : theme.text1)};
  margin-left: 12px;
`

function DropDownOption(tokens: Token[], poolName: string): JSX.Element {
  const tokensAddress = tokens.map((token) => token.address)
  const logos = useCurrencyLogos(tokensAddress)

  function getImageSize() {
    return isMobile ? 22 : 22
  }

  return (
    <DropDownItem>
      {tokens.length > 1 ? (
        <>
          <MultipleImageWrapper>
            {logos.map((logo, index) => {
              return (
                <ImageWithFallback
                  src={logo}
                  width={getImageSize()}
                  height={getImageSize()}
                  alt={`Logo`}
                  key={index}
                  round
                />
              )
            })}
          </MultipleImageWrapper>
          <div>
            {tokens.map((token, index) => {
              return (
                <>
                  <span>{token.name}</span>
                  {index + 1 !== tokens.length && <span>-</span>}
                </>
              )
            })}
          </div>
        </>
      ) : (
        <>
          <SingleImageWrapper>
            <ImageWithFallback src={logos[0]} width={getImageSize()} height={getImageSize()} alt={`Logo`} round />
          </SingleImageWrapper>
          <div>{poolName}</div>
        </>
      )}
    </DropDownItem>
  )
}

export default function StatsHeader({
  items,
  pid,
  onSelectDropDown,
}: {
  items: { name: string; value: string | number }[]
  pid: number
  onSelectDropDown: (index: number) => void
}) {
  const dropDownOptions = Stakings.map((staking) => {
    const { name, tokens, id } = staking
    return { value: name, label: DropDownOption(tokens, name), index: id }
  })
  return (
    <Wrapper>
      <ItemBox>
        <Dropdown
          options={dropDownOptions}
          defaultValue={pid}
          placeholder={''}
          onSelect={onSelectDropDown}
          width={'197px'}
        />
      </ItemBox>

      {items.map((item, index) => (
        <Item key={index}>
          <Name>{item.name}</Name>
          <Value NudeColor={index === 2}>{item.value}</Value>
        </Item>
      ))}
    </Wrapper>
  )
}
