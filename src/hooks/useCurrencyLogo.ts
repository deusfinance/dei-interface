import { useMemo } from 'react'

import NotFound from '/public/static/images/fallback/not_found.png'
import DEI_LOGO from '/public/static/images/tokens/dei.svg'
import DEUS_LOGO from '/public/static/images/tokens/deus.svg'
import USDC_LOGO from '/public/static/images/tokens/usdc.svg'
import BDEI_LOGO from '/public/static/images/tokens/bdei.svg'
import vDEUS_LOGO from '/public/static/images/tokens/vdeus.svg'
import DAI_LOGO from '/public/static/images/tokens/dai.svg'

const LogoMap: { [contractOrSymbol: string]: string } = {
  // symbols
  FTM: 'https://assets.spooky.fi/tokens/FTM.png',
  DEI: DEI_LOGO,
  DEUS: DEUS_LOGO,
  // contracts
  // make sure these values are checksummed! https://ethsum.netlify.app/
  '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83': 'https://assets.spooky.fi/tokens/wFTM.png', // wFTM
  '0x04068DA6C83AFCFA0e13ba15A6696662335D5B75': USDC_LOGO,
  '0xDE12c7959E1a72bbe8a5f7A1dc8f8EeF9Ab011B3': DEI_LOGO,
  '0xDE5ed76E7c05eC5e4572CfC88d1ACEA165109E44': DEUS_LOGO,
  '0x05f6ea7F80BDC07f6E0728BbBBAbebEA4E142eE8': BDEI_LOGO,
  '0x953Cd009a490176FcEB3a26b9753e6F01645ff28': vDEUS_LOGO,
  '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063': USDC_LOGO, // scUSDC
  '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643': DAI_LOGO, // scDAI
}

export default function useCurrencyLogo(contractOrSymbol?: string): string {
  return useMemo(() => {
    try {
      if (contractOrSymbol && contractOrSymbol in LogoMap) {
        return LogoMap[contractOrSymbol]
      }
      return `https://assets.spooky.fi/tokens/${contractOrSymbol}.png`
    } catch (err) {
      return NotFound.src
    }
  }, [contractOrSymbol])
}
