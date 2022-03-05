import { useMemo } from 'react'

import NotFound from '/public/static/images/fallback/not_found.png'

// make sure these values are checksummed
const LogoMap: { [contractOrSymbol: string]: string } = {
  FTM: 'https://assets.spookyswap.finance/tokens/FTM.png',
  '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83': 'https://assets.spookyswap.finance/tokens/wFTM.png', // wFTM
  '0x82f0B8B456c1A451378467398982d4834b6829c1': 'https://assets.spookyswap.finance/tokens/MIM.png', // MIM
}

export default function useCurrencyLogo(contract?: string): string {
  return useMemo(() => {
    try {
      if (contract && contract in LogoMap) {
        return LogoMap[contract]
      }
      return NotFound.src
    } catch (err) {
      return NotFound.src
    }
  }, [contract])
}
