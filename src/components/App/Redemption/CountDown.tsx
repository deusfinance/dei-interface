import { useState, useEffect } from 'react'

export const CountDown = ({
  hours,
  minutes,
  seconds,
}: {
  hours: number
  minutes: number
  seconds: number
}): JSX.Element => {
  const [time, setTime] = useState({
    hours,
    minutes,
    seconds,
  })
  const [over, setOver] = useState(false)
  useEffect(() => {
    const timer = setInterval(() => tick(), 1000)
    return () => clearInterval(timer)
  })
  const tick = () => {
    if (time.hours === 0 && time.minutes === 0 && time.seconds === 0) {
      setOver(true)
    } else if (time.minutes === 0 && time.seconds === 0) {
      setTime({
        hours: time.hours - 1,
        minutes: 59,
        seconds: 59,
      })
    } else if (time.seconds === 0) {
      setTime({
        hours: time.hours,
        minutes: time.minutes - 1,
        seconds: 59,
      })
    } else {
      setTime({
        hours: time.hours,
        minutes: time.minutes,
        seconds: time.seconds - 1,
      })
    }
  }
  return (
    <>
      <p>{`${time.hours.toString().padStart(2, '0')} : ${time.minutes.toString().padStart(2, '0')} : ${time.seconds
        .toString()
        .padStart(2, '0')}`}</p>
    </>
  )
}
