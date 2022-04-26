import React from 'react'
import { useRanger } from 'react-ranger'
import styled from 'styled-components'

const Label = styled.div`
  margin-bottom: 10px;
  font-size: 0.8rem;
`

export default function Slider({
  min,
  max,
  values,
  setValues,
  label,
}: {
  min: number
  max: number
  values: number[]
  setValues: React.Dispatch<React.SetStateAction<number[]>>
  label: string
}) {
  const { getTrackProps, handles } = useRanger({
    min,
    max,
    stepSize: 1,
    values,
    onDrag: setValues,
  })

  return (
    <>
      <Label>{label}</Label>
      <div
        {...getTrackProps({
          style: {
            height: '4px',
            background: 'linear-gradient(to right, #ED2938, #00FF7F)',
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,.6)',
            borderRadius: '4px',
            overflowY: 'visible',
          },
        })}
      >
        {handles.map(({ getHandleProps }) => (
          <button
            {...getHandleProps({
              style: {
                width: '15px',
                height: '15px',
                outline: 'none',
                borderRadius: '100%',
                background: 'linear-gradient(to bottom, #eee 45%, #ddd 55%)',
                border: 'solid 1px #545454',
              },
            })}
          />
        ))}
      </div>
    </>
  )
}
