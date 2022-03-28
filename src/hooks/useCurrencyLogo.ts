import { useMemo } from 'react'

import NotFound from '/public/static/images/fallback/not_found.png'
import DEI_LOGO from '/public/static/images/tokens/dei.svg'
import DEUS_LOGO from '/public/static/images/tokens/deus.svg'

// make sure these values are checksummed!
// https://ethsum.netlify.app/
const LogoMap: { [contractOrSymbol: string]: string } = {
  FTM: 'https://assets.spookyswap.finance/tokens/FTM.png',
  '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83': 'https://assets.spookyswap.finance/tokens/wFTM.png', // wFTM
  '0x04068DA6C83AFCFA0e13ba15A6696662335D5B75': 'https://assets.spookyswap.finance/tokens/USDC.png', // USDC
  '0xDE12c7959E1a72bbe8a5f7A1dc8f8EeF9Ab011B3': DEI_LOGO,
  '0xDE5ed76E7c05eC5e4572CfC88d1ACEA165109E44': DEUS_LOGO,

  // THESE ASSETS ARE TEMPORARILY / TESTNET TOKENS
  '0xCD9a7E6383F218e13c868c2328E9F4ad8a65f312': 'https://assets.spookyswap.finance/tokens/USDC.png',
  '0x4A4573B03B0800e24dEcD8fE497BFeD98ee344B8': DEI_LOGO,
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
