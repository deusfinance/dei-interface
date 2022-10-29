import React from 'react'

export default function Staking({
  width = 18,
  height = 18,
  ...rest
}: {
  width?: number
  height?: number
  [x: string]: any
}) {
  return (
    <svg width={width} height={height} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" {...rest}>
      <rect x="0.6" y="0.6" width="16.8" height="16.8" rx="1.4" stroke="#D9D9D9" strokeWidth="1.2" />
      <rect x="4" y="13.6001" width="10" height="1.6" rx="0.2" fill="#D9D9D9" />
      <rect x="3.5" y="11.3" width="10" height="1.6" rx="0.2" fill="#D9D9D9" />
      <rect x="4.5" y="9" width="10" height="1.6" rx="0.2" fill="#D9D9D9" />
    </svg>
  )
}
