import React, { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import { isMobile } from 'react-device-detect'
import DatePicker from 'react-datepicker'
import { Calendar } from 'react-feather'
import useWeb3React from 'hooks/useWeb3'

import ImageWithFallback from 'components/ImageWithFallback'
import Box from 'components/Box'
import { RowCenter, RowStart, RowEnd } from 'components/Row'

import 'react-datepicker/dist/react-datepicker.css'

const Wrapper = styled(Box)`
  justify-content: flex-start;
  align-items: flex-start;
  height: 70px;
  gap: 10px;
  padding: 0.6rem;
  align-items: center;
  .react-datepicker-wrapper {
    width: unset;
  }
  .red-border {
    margin-left: 10px;
    font-size: 1.5rem;
    border: none;
    background: transparent;
    outline: none;
  }
  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 0.5rem;
  `}
`

const Column = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
`

const LogoWrap = styled(RowCenter)`
  border-radius: 50%;
  border: 1px solid #afafd6;
  width: 50px;
  height: 50px;
`

export default function InputDate({ value, onChange }: { value: string; onChange(x?: string): void }) {
  const { account } = useWeb3React()
  const [periodLevel, setPeriodLevel] = useState(0)
  const minTimeStamp = 86400 * (7 * 1)
  const lockedEnd = 0
  const minDate = useMemo(() => {
    if (lockedEnd === 0) {
      return new Date(new Date().getTime() + minTimeStamp * 1000)
    } else {
      return new Date(lockedEnd * 1000 + 86400 * 7 * 1000)
    }
  }, [lockedEnd])

  const maxDate = new Date(
    Math.floor(new Date().getTime() / 86400 / 1000) * 86400 * 1000 + 3600 * 24 * (365 * 4) * 1000
  )
  const [selectedDate, setSelectedDate] = useState(minDate)

  const unlockTime = useMemo(() => {
    return Math.floor(selectedDate.getTime() / 1000)
  }, [selectedDate])

  const isWeekday = (date) => {
    return 4 === date.getDay(date)
  }

  const handleClick = useCallback(() => {}, [])

  return (
    <>
      <RowEnd my="10px" pr="5px"></RowEnd>
      <Wrapper>
        <Column>
          <LogoWrap>
            <Calendar color="#31dbea" size={'30px'} />
          </LogoWrap>
        </Column>
        <DatePicker
          selected={selectedDate}
          dateFormat="yyyy/MM/dd"
          className="red-border"
          filterDate={isWeekday}
          onChange={(date) => {
            if (periodLevel >= 0) {
              setPeriodLevel(-1)
            }
            if (date.getTime() === selectedDate.getTime()) {
              return
            }
            setSelectedDate(new Date(Math.floor(date.getTime() / 1000 / 7 / 86400) * 7 * 86400 * 1000))
          }}
          minDate={minDate}
          maxDate={maxDate}
          showMonthDropdown
        />
      </Wrapper>
    </>
  )
}
