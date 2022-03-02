import React from 'react'

import { BorrowComponent } from 'hooks/useBorrowList'

export default function Repay({ component }: { component: BorrowComponent }) {
  return <div>Lets repay {component.component}</div>
}
