import React from 'react'
import styled from 'styled-components'

import { StakingType } from 'constants/stakingPools'

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

const ItemBox = styled.div`
  display: inline-block;
  padding: 8px 10px;
  margin: 0 24px;
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

export default function StatsHeader({
  items,
  pool,
}: {
  items: { name: string; value: string | number }[]
  pool: StakingType
}) {
  return (
    <Wrapper>
      <ItemBox>
        {/* TODO: Pool selector goes here */}
        <Value>{pool?.name}</Value>
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
