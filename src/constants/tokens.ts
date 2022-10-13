import { SupportedChainId } from 'constants/chains'
import { Token } from '@sushiswap/core-sdk'
import { USDC_ADDRESS, DEUS_ADDRESS, DEI_ADDRESS, BDEI_ADDRESS } from './addresses'

export const DEI_TOKEN = new Token(SupportedChainId.FANTOM, DEI_ADDRESS[SupportedChainId.FANTOM], 18, 'DEI', 'DEI')

export const USDC_TOKEN = new Token(SupportedChainId.FANTOM, USDC_ADDRESS[SupportedChainId.FANTOM], 6, 'USDC', 'USDC')

export const DEUS_TOKEN = new Token(SupportedChainId.FANTOM, DEUS_ADDRESS[SupportedChainId.FANTOM], 18, 'DEUS', 'DEUS')

export const BDEI_TOKEN = new Token(SupportedChainId.FANTOM, BDEI_ADDRESS[SupportedChainId.FANTOM], 18, 'bDEI', 'bDEI')

export const VDEUS_TOKEN = new Token(
  SupportedChainId.FANTOM,
  '0x953Cd009a490176FcEB3a26b9753e6F01645ff28',
  18,
  'vDEUS',
  'vDEUS'
)

export const DEI_BDEI_LP_TOKEN = new Token(
  SupportedChainId.FANTOM,
  '0xDce9EC1eB454829B6fe0f54F504FEF3c3C0642Fc',
  18,
  'DB-LP',
  'DB-LP'
)

export const DEUS_VDEUS_LP_TOKEN = new Token(
  SupportedChainId.FANTOM,
  '0xECd9E18356bb8d72741c539e75CEAdB3C5869ea0',
  18,
  'DV-LP',
  'DV-LP'
)

export const scUSDC_TOKEN = new Token(
  SupportedChainId.FANTOM,
  '0xE45Ac34E528907d0A0239ab5Db507688070B20bf',
  18,
  'scUSDC',
  'Scream Wrapped USDC'
)

export const scDAI_TOKEN = new Token(
  SupportedChainId.FANTOM,
  '0x8D9AED9882b4953a0c9fa920168fa1FDfA0eBE75',
  18,
  'scDAI',
  'Scream Wrapped DAI'
)
