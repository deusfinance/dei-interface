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
  '0xdce9ec1eb454829b6fe0f54f504fef3c3c0642fc',
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
