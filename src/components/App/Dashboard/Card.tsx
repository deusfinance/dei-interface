import { useState } from 'react'
import styled from 'styled-components'
import { isMobile } from 'react-device-detect'

import { Row, RowBetween } from 'components/Row'

const Wrapper = styled(RowBetween)<{ disabled?: boolean }>`
  color: ${({ theme }) => theme.text1};
  background: ${({ theme }) => theme.bg0};
  flex-direction: column;
  /* overflow-x: scroll; */
  overflow: hidden;
  /* min-width: 382px; */
  /* max-width: 382px; */
  height: 161px;
  border-radius: 12px;
  border: 2px solid ${({ theme }) => theme.border2};

  & > * {
    &:first-child {
      /* display: flex; */
      /* justify-content: space-between; */
      /* padding: 16px; */
      /* height: 100px; */
      width: 100%;
    }
    /* &:nth-child(2) {
      overflow: scroll;
    } */
  }
  &:hover {
    border-color: ${({ theme, disabled }) => (disabled ? theme.border2 : theme.text3)};
    background: ${({ theme, disabled }) => (disabled ? theme.bg0 : theme.bg3)};
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    min-width:160px;
    & > * {
      &:first-child {
        // height: 78px;
        // padding: 12px;
      }
  }
  `};
`

const TopWrap = styled(RowBetween)`
  width: 100%;
  padding: 0px 10px;
  margin: 20px 16px 0px 26px;
`

const ChildrenContent = styled(Row)`
  overflow-x: scroll;
  margin: auto 0px;
  width: 100%;

  & > * {
    margin: 0px 8px;
    min-width: 312px;
  }
`

const TitleWrap = styled.div`
  color: ${({ theme }) => theme.text1};
  font-weight: 600;
  font-size: 16px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 16px;
  `}
`

const SubText = styled.div`
  color: ${({ theme }) => theme.text1};
  font-size: 12px;
  white-space: nowrap;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 10px;
  `}
`

export const getImageSize = () => {
  return isMobile ? 50 : 80
}

export const Card = ({
  title,
  subTitle,
  href,
  currentItem,
}: {
  title: string | null
  subTitle?: string | null
  href: string
  currentItem?: JSX.Element | null
}): JSX.Element => {
  const [hover, setHover] = useState(false)
  const disabled = href === ''

  return (
    <Wrapper disabled={disabled} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <TopWrap>
        <TitleWrap>{title}</TitleWrap>
        {subTitle && <SubText>{subTitle}</SubText>}
      </TopWrap>
      {currentItem ? <ChildrenContent>{currentItem}</ChildrenContent> : <>hello</>}
      {/* <ChildrenContent>
        {MigrationStates.map((migrationState, index) => {
          const { inputToken, outputToken, leverage } = migrationState
          return (
            <Box
              key={index}
              index={index}
              currencyFrom={inputToken}
              currencyTo={outputToken}
              active={false}
              leverage={leverage}
              onTokenSelect={(value: number) => {
                console.log(value)
              }}
            />
          )
        })}
      </ChildrenContent> */}
    </Wrapper>
  )
}
