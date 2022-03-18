import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import DatePicker from 'react-datepicker'
import { Calendar } from 'react-feather'
import dayjs from 'dayjs'
import isoWeek from 'dayjs/plugin/isoWeek'

import Box from 'components/Box'
import { RowCenter } from 'components/Row'

import 'react-datepicker/dist/react-datepicker.css'
import { darken, lighten } from 'polished'

const Wrapper = styled(Box)`
  justify-content: flex-start;
  align-items: center;
  height: 70px;
  gap: 10px;
  padding: 0.6rem;

  &:hover {
    cursor: pointer;
  }

  & > {
    &:last-child {
      margin-left: auto;
    }
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 0.5rem;
  `}

  .react-datepicker-wrapper {
    margin-left: auto;
  }

  .styled-date-picker {
    text-align: right;
    font-size: 1.5rem;
    border: none;
    align-items: flex-end;
    background: transparent;
    outline: none;
    color: ${({ theme }) => theme.text2};
  }

  // dont touch this
  .react-datepicker__navigation-icon {
    width: 20px;
  }

  // dont touch this
  .react-datepicker__navigation-icon::before {
    border-color: black !important;
  }
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

function getMinimum() {
  dayjs.extend(isoWeek)
  const today = dayjs().day()
  // if we haven't yet passed Thursday
  if (today <= 4) {
    // then just return this week's instance of Thursday
    return dayjs().isoWeekday(4).toDate()
  }
  // otherwise, return *next week's* instance
  return dayjs().add(1, 'week').isoWeekday(4).toDate()
}

function getMaximum() {
  return dayjs().add(4, 'year').add(3, 'day').toDate()
}

export default function InputDate({ selectedDate, onDateSelect }: { selectedDate: Date; onDateSelect(x: Date): void }) {
  const [minDate, maxDate] = useMemo(() => {
    return [getMinimum(), getMaximum()]
  }, [])

  useEffect(() => {
    onDateSelect(minDate)
  }, [minDate])

  return (
    <>
      <Wrapper>
        <Column>
          <LogoWrap>
            <Calendar color="#31dbea" size={'30px'} />
          </LogoWrap>
        </Column>
        <div>
          <DatePicker
            selected={selectedDate}
            className="styled-date-picker"
            dateFormat="MMMM d, yyyy"
            onChange={(value: Date) => {
              // check if the 7-day minimum applies
              const minimum = getMinimum()
              if (value.getTime() < minimum.getTime()) {
                return onDateSelect(minimum)
              }
              return onDateSelect(value)
            }}
            minDate={minDate}
            maxDate={maxDate}
            showMonthDropdown
            showWeekNumbers
          />
        </div>
      </Wrapper>
    </>
  )
}

const ExpirationWrapper = styled(Box)`
  display: flex;
  flex-flow: row nowrap;
  gap: 5px;
  justify-content: space-between;
  align-items: center;
  background: ${({ theme }) => theme.bg1};
  padding: 5px;
  font-size: 0.8rem;
`

const Toggle = styled.div<{
  selected: boolean
}>`
  flex: 1;
  background: ${({ selected, theme }) => (selected ? lighten(0.1, theme.bg3) : darken(0.05, theme.bg3))};
  height: 1.5rem;
  line-height: 1.5rem;
  border-radius: 5px;
  text-align: center;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.text3};
  &:hover {
    cursor: pointer;
  }
`

enum Checked {
  W,
  M,
  Y,
  Y4,
}

export function DateToggle({ onDateSelect }: { onDateSelect: (x: Date) => void }) {
  const [checked, setChecked] = useState<Checked>(Checked.W)

  useEffect(() => {
    if (checked === Checked.W) {
      return onDateSelect(dayjs().add(1, 'week').toDate())
    }
    if (checked === Checked.M) {
      return onDateSelect(dayjs().add(1, 'month').toDate())
    }
    if (checked === Checked.Y) {
      return onDateSelect(dayjs().add(1, 'year').toDate())
    }
    return onDateSelect(dayjs().add(4, 'years').toDate())
  }, [checked])

  return (
    <ExpirationWrapper>
      Expiration:
      <Toggle selected={checked === Checked.W} onClick={() => setChecked(Checked.W)}>
        1 Week
      </Toggle>
      <Toggle selected={checked === Checked.M} onClick={() => setChecked(Checked.M)}>
        1 Month
      </Toggle>
      <Toggle selected={checked === Checked.Y} onClick={() => setChecked(Checked.Y)}>
        1 Year
      </Toggle>
      <Toggle selected={checked === Checked.Y4} onClick={() => setChecked(Checked.Y4)}>
        4 Years
      </Toggle>
    </ExpirationWrapper>
  )
}
