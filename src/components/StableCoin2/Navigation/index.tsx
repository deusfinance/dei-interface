import React from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  gap: 20px;
  margin-left: 30px;
`

const Item = styled.div<{
  selected: boolean
}>`
  font-size: 15px;
  transition: all 0.3s ease;
  border-bottom: 1px solid ${({ selected, theme }) => (selected ? theme.text1 : 'transparent')};
  color: ${({ selected, theme }) => (selected ? theme.text1 : theme.text3)};
  &:hover {
    cursor: pointer;
  }
`

export enum ActionTypes {
  ADD = 'ADD',
  REMOVE = 'REMOVE',
}

const ActionLabels = {
  [ActionTypes.ADD]: 'Add',
  [ActionTypes.REMOVE]: 'Remove',
}

export default function ActionSetter({
  selected,
  setSelected,
}: {
  selected: string
  setSelected: (value: ActionTypes) => void
}) {
  return (
    <Wrapper>
      {(Object.keys(ActionTypes) as Array<keyof typeof ActionTypes>).map((key, index) => {
        const label = ActionLabels[key]
        return (
          <Item selected={key == selected} onClick={() => setSelected(ActionTypes[key])} key={index}>
            s{label}
          </Item>
        )
      })}
    </Wrapper>
  )
}
