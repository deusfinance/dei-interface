import dayjs from 'dayjs'
import isoWeek from 'dayjs/plugin/isoWeek'

dayjs.extend(isoWeek)

/**
 * IMPORTANT NOTE:
 * Do not use any interval identifiers other than 'day' due to leap years.
 */

const THURSDAY = 4

export enum VestOptions {
  MIN,
  MONTH,
  YEAR,
  MAX,
}

export function lastThursday(targetDate: Date): Date {
  const target = dayjs(targetDate)
  const targetWeek = target.day() >= THURSDAY ? target : target.subtract(7, 'days')
  return targetWeek.isoWeekday(THURSDAY).toDate()
}

export function getMinimumDate(lockEnd?: Date): Date {
  const now = lockEnd ? dayjs(lockEnd) : dayjs()
  const day = now.day()

  // if we haven't yet passed Thursday
  if (day < THURSDAY) {
    // then just return this week's instance of Thursday
    return dayjs().isoWeekday(THURSDAY).toDate()
  }
  // otherwise, return *next week's* instance
  return dayjs().add(7, 'day').isoWeekday(THURSDAY).toDate()
}

export function getMaximumDate(): Date {
  const target = dayjs().add(365 * 4, 'day')
  return lastThursday(target.toDate())
}

export function getMinimumDateByLockEnd(lockEnd: Date): Date {
  const minimum = addWeek(lockEnd)
  const maximum = getMaximumDate()
  return dayjs(minimum).isBefore(maximum, 'day') ? minimum : maximum
}

export function addWeek(startDate: Date): Date {
  const date = startDate ? dayjs(startDate) : dayjs()
  const target = date.add(7, 'day')
  return lastThursday(target.toDate())
}

export function addMonth(startDate?: Date): Date {
  const date = startDate ? dayjs(startDate) : dayjs()
  const target = date.add(30, 'day')
  return lastThursday(target.toDate())
}

export function addYear(startDate?: Date): Date {
  const date = startDate ? dayjs(startDate) : dayjs()
  const target = date.add(365, 'day')
  return lastThursday(target.toDate())
}
