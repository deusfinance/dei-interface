import React from 'react'
import styled from 'styled-components'
import { ChevronDown } from 'react-feather'

import { Row, RowCenter } from 'components/Row'

const Wrapper = styled(Row)`
  background: ${({ theme }) => theme.bg2};
  border-radius: 12px;
  color: ${({ theme }) => theme.text2};
  white-space: nowrap;
  height: 80px;
  border: 1px solid #444444;
  border-color: ${({ theme }) => theme.border1};
  position: relative;
  cursor: ${({ disabled }) => !disabled && 'pointer'};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    height: 65px;
  `}

  &:hover {
    border-color: ${({ theme }) => theme.border2};
    background: ${({ theme }) => theme.bg3};
  }
`

const InputWrapper = styled.div<{
  active: string
}>`
  color: ${({ active, theme }) => (active ? theme.text1 : theme.text2)};

  & > * {
    width: 100%;
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    right: 0;
  `}
`

const ItemWrapper = styled.div`
  width: 100%;
  padding: 6px;
  padding-left: 16px;
  position: relative;
`

export const LogoWrapper = styled(RowCenter)`
  height: 100%;
  border-right: 1px solid ${({ theme }) => theme.border1};
  /* padding-left: 10px; */
  width: 82px;
`

const StyledChevron = styled(ChevronDown)`
  size: 20px;
  position: absolute;
  right: 16px;
`

export default function SelectBox({
  value,
  currentItem,
  onSelect,
  placeholder,
  disabled,
}: {
  value: string
  currentItem?: JSX.Element | null
  onSelect?: any
  placeholder?: string
  disabled?: boolean
}) {
  return (
    <>
      <Wrapper disabled={disabled} onClick={onSelect ? () => onSelect() : undefined}>
        {currentItem ? (
          currentItem
        ) : (
          <ItemWrapper>
            <InputWrapper active={value}>{value || placeholder}</InputWrapper>
          </ItemWrapper>
        )}
        <StyledChevron />
      </Wrapper>
    </>
  )
}
