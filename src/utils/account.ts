import { isAddress } from './validate'
import { hexStripZeros } from '@ethersproject/bytes'
import { BigNumber } from '@ethersproject/bignumber'

export function truncateAddress(address: string, chars = 4) {
  const parsed = isAddress(address)
  if (!parsed) {
    console.error(`Invalid 'address' parameter '${address}'.`)
    return null
  }
  return `${parsed.substring(0, chars + 2)}...${parsed.substring(42 - chars)}`
}

export function formatChainId(chainId: string) {
  return hexStripZeros(BigNumber.from(chainId).toHexString())
}
