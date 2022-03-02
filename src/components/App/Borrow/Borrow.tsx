import React from 'react'

import { BorrowComponent } from 'hooks/useBorrowList'

export default function Borrow({ component }: { component: BorrowComponent }) {
  return <div>Lets borrow {component.component}</div>
}
