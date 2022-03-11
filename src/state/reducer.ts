import { combineReducers } from '@reduxjs/toolkit'

import application from './application/reducer'
import borrow from './borrow/reducer'
import multicall from './multicall/reducer'
import transactions from './transactions/reducer'
import user from './user/reducer'

const reducer = combineReducers({
  application,
  borrow,
  multicall,
  transactions,
  user,
})

export default reducer
