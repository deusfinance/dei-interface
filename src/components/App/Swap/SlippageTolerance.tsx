import React, { useState, useMemo, useCallback } from 'react'
import styled, { css } from 'styled-components'
import { Button as RebassButton } from 'rebass/styled-components'

export const Base = styled(RebassButton)<{ padding?: string; borderRadius?: string; active?: any }>`
  padding: ${({ padding }) => (padding ? padding : '0')};
  width: ${({ width }) => width && width};
  height: ${({ height }) => height && height};
  font-weight: 400;
  text-align: center;
  border-radius: 6px;
  border-radius: ${({ borderRadius }) => borderRadius && borderRadius};
  outline: none;
  border: 0;
  color: ${({ theme }) => theme.text1};
  text-decoration: none;
  display: flex;
  justify-content: center;
  flex-wrap: nowrap;
  align-items: center;
  cursor: ${({ active }) => active && 'pointer'};
  position: relative;
  z-index: 1;
  transition: all 0.35s;
  &:disabled {
    cursor: auto;
  }
  > * {
    user-select: none;
  }
`

export const StyleSwapBase = css`
  background-color: rgb(13 13 13);
  border-radius: 15px;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  text-align: center;
  margin: auto;
  width: 100%;
  max-width: 500px;
`

export const StyleTitles = css`
  .inner-title {
    font-size: 0.8rem;
    /* opacity: 0.75; */
  }
`

export const FlexCenter = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`

export const flexCenter = css`
  display: flex;
  align-items: center;
  justify-content: center;
`

const Wrapper = styled(FlexCenter)`
  ${StyleSwapBase}
  ${StyleTitles}
  margin-top: 10px;
  justify-content: space-between;
  padding: 10px 20px;

  &::first-child {
    position: absolute;
    left: 20px;
  }
`

export const Option = styled(Base)<{ theme?: any; active?: any; bgColor?: string }>`
  display: inline-flex;
  color: ${({ theme, active }) => (active ? theme.text1 : theme.text2)};
  border: ${({ theme, active }) => (active ? `1px solid ${theme.yellow2}` : `1px solid ${theme.text1}`)};
  margin: 1px;
  margin-right: 5px;
  height: 25px;
  width: 50px;
  /* width: 100%; */
  /* height: 100%; */
  font-size: 13px;
  transition: all 0s;
  cursor: ${({ active }) => (active ? 'default' : 'pointer')};
  border-radius: 8px;

  &:hover {
    border: ${({ theme, active }) => (active ? `2px solid ${theme.yellow2}` : `1px solid ${theme.text1}`)};
  }

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    width: 40px;
  `}
`

export const CustomOption = styled.div<{ active?: any }>`
  font-size: 13px;
  height: 25px;
  margin: 1px;
  border: 1px solid ${({ theme, active }) => (active ? theme.yellow2 : theme.text1)};
  padding: 0 5px;
  display: inline-flex;
  justify-content: flex-end;
  align-items: center;
  border-radius: 8px;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    width: 45px;
  `}
`

const InputSlippage = styled.input.attrs({ type: 'number', min: 0.1 })`
  direction: rtl;
  color: #ffffff;
  border: 0;
  outline: none;
  width: 60px;
  margin-right: 2px;
  background: transparent;
`

const defaultAmounts = [0.1, 0.5, 1]

export default function SlippageTolerance({
  slippage,
  setSlippage,
  style,
  bgColor,
}: {
  slippage: number
  setSlippage: (value: number) => void
  style?: any // TODO
  bgColor: string
}) {
  const [customActive, setCustomActive] = useState(false)

  const handleMinSlippage = useCallback(() => {
    if (slippage < 0.1) {
      setSlippage(0.1)
      setCustomActive(false)
    }
  }, [setSlippage, slippage, setCustomActive])

  const handleCustomChange = useCallback(
    (e) => {
      if (e.currentTarget.value !== '') {
        setCustomActive(true)
        setSlippage(parseFloat(e.currentTarget.value))
      } else {
        setCustomActive(false)
        setSlippage(0.5)
      }
    },
    [setSlippage, setCustomActive]
  )

  return useMemo(() => {
    return (
      <Wrapper style={style}>
        <div className="inner-title">Slippage</div>
        <div style={{ display: 'inline-block' }}>
          {defaultAmounts.map((amount) => {
            return (
              <Option
                key={amount}
                active={amount === slippage && !customActive}
                bgColor={bgColor}
                onClick={() => {
                  setCustomActive(false)
                  setSlippage(amount)
                }}
              >
                {amount}%
              </Option>
            )
          })}
          <CustomOption active={customActive}>
            <InputSlippage
              value={customActive ? slippage : ''}
              onBlur={handleMinSlippage}
              onChange={(e) => handleCustomChange(e)}
            />
            %
          </CustomOption>
        </div>
      </Wrapper>
    )
  }, [style, setSlippage, handleCustomChange, handleMinSlippage, slippage, setCustomActive, bgColor, customActive])
}
