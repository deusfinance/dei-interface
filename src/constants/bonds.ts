import { Token } from '@sushiswap/core-sdk'
import { SupportedChainId } from 'constants/chains'
import { USDC } from 'constants/addresses'

export const USDC_TOKEN = new Token(SupportedChainId.FANTOM, USDC[SupportedChainId.FANTOM], 6, 'USDC', 'USD//C')
