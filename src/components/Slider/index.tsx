import React, { useState, useEffect } from 'react'
import { useRanger } from 'react-ranger'
import styled from 'styled-components'

const Amount = styled.div`
  margin-bottom: 15px;
  font-size: 0.8rem;
`

export default function Slider({
  percent,
  min,
  onSliderChange,
}: {
  percent: number
  min: number
  onSliderChange: (values: number) => void
}) {
  const [value, setValue] = useState(percent)

  const { getTrackProps, handles } = useRanger({
    min,
    max: 100,
    stepSize: 1,
    values: [value],
    onDrag: (values) => setValue(values[0]),
    onChange: () => onSliderChange(value),
  })

  useEffect(() => {
    setValue(percent)
  }, [percent])

  return (
    <>
      <Amount>{value}</Amount>
      <div
        {...getTrackProps({
          style: {
            height: '4px',
            background: min > 0 ? '#00FF70' : 'linear-gradient(to right, #ED2938, #00FF7F)',
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,.6)',
            borderRadius: '4px',
            overflowY: 'visible',
          },
        })}
      >
        {handles.map(({ getHandleProps }, index) => (
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
            key={index}
          />
        ))}
      </div>
    </>
  )
}
