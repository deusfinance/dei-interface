import { useMemo } from 'react'

import NotFound from '/public/static/images/fallback/not_found.png'
import DEI_LOGO from '/public/static/images/tokens/dei.svg'

// make sure these values are checksummed!
// https://ethsum.netlify.app/
const LogoMap: { [contractOrSymbol: string]: string } = {
  FTM: 'https://assets.spookyswap.finance/tokens/FTM.png',
  '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83': 'https://assets.spookyswap.finance/tokens/wFTM.png', // wFTM
  '0x82f0B8B456c1A451378467398982d4834b6829c1': 'https://assets.spookyswap.finance/tokens/MIM.png', // MIM
  '0xCD9a7E6383F218e13c868c2328E9F4ad8a65f312': 'https://assets.spookyswap.finance/tokens/USDC.png', // TEMPORARY
  '0x4A4573B03B0800e24dEcD8fE497BFeD98ee344B8': DEI_LOGO, // TEMPORARY
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
