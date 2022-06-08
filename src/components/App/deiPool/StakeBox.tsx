import React from 'react'
import styled from 'styled-components'

import useWeb3React from 'hooks/useWeb3'

import { RowBetween } from '../../Row/index'
import { PrimaryButton } from 'components/Button'

const Wrapper = styled.div`
  color: ${({ theme }) => theme.text2};
  white-space: nowrap;
  height: 80px;
  gap: 10px;
  padding: 0.6rem;
  border: 1px solid gray;
  border-radius: 4px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 0.5rem;
  `}
`

const TextData = styled.span`
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.93);
  margin: 0.22rem;
`

const Row = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: flex-start;
  gap: 10px;
  font-size: 1.5rem;
  align-items: center;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    gap: 3px;
  `}
`

const ActionButton = styled(PrimaryButton)`
  margin-top: 6px;
  height: 46px;
  width: 170px;
`

export default function StakeBox({
  value,
  onClick,
  title,
  disabled,
  type,
}: {
  value: string
  onClick(values: string): void
  title: string
  disabled?: boolean
  type: string
}) {
  const { account } = useWeb3React()

  return (
    <>
      <Wrapper>
        <div>
          <RowBetween alignItems={'center'}>
            <TextData>{title}</TextData>
          </RowBetween>
          <RowBetween>
            <TextData>{value}</TextData>
          </RowBetween>
        </div>

        <div>
          <ActionButton active>{type}</ActionButton>
        </div>
      </Wrapper>
    </>
  )
}
