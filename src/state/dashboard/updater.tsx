import { useEffect } from 'react'
import { useAppDispatch, AppThunkDispatch } from 'state'

import { autoRefresh } from 'utils/retry'
import { fetchData } from './reducer'

export default function Updater(): null {
  const thunkDispatch: AppThunkDispatch = useAppDispatch()

  useEffect(() => {
    return autoRefresh(() => thunkDispatch(fetchData()), 60)
  }, [thunkDispatch])

  return null
}
