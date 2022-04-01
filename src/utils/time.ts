import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)

export enum RoundMode {
  ROUND_DOWN,
  ROUND_UP,
}

export function getDurationSeconds(targetDate: Date, ROUND_MODE: RoundMode): number {
  const now = dayjs.utc().unix()
  const then = dayjs.utc(targetDate).unix()
  const result = then - now
  return ROUND_MODE === RoundMode.ROUND_DOWN ? Math.floor(result) : Math.ceil(result)
}
