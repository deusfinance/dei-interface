import { useEffect } from 'react'
import { useAppDispatch } from 'state'

import { setPools } from './reducer'
import { BorrowPools } from 'constants/borrow'

export default function Updater(): null {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(setPools(BorrowPools))
  }, [dispatch])

  return null
}
