import { ethers } from 'ethers'
import { BigNumber } from '@ethersproject/bignumber/lib.esm'

const InputDataDecoder = require('ethereum-input-data-decoder')

export function encodeEthResult(abi: any, funcName: string, result: (BigNumber | string | number)[]) {
  const iface = new ethers.utils.Interface(abi)
  return iface.encodeFunctionResult(funcName, result)
}

export function decodeEthCall(abi: any, input: any) {
  const decoder = new InputDataDecoder(abi)
  return decoder.decodeData(input)
}
