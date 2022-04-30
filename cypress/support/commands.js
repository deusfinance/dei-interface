// ***********************************************
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

import { Eip1193Bridge } from '@ethersproject/experimental/lib/eip1193-bridge'
import { JsonRpcProvider } from '@ethersproject/providers'
import { Wallet } from '@ethersproject/wallet'
import { formatChainId, truncateAddress } from '../../src/utils/account'
import { SupportedChainId } from '../../src/constants/chains'
import { Multicall2, veNFT } from '../../src/constants/addresses'
import VENFT_ABI from '../../src/constants/abi/veNFT.json'
import MULTICALL2_ABI from '../../src/constants/abi/MULTICALL2.json'

import { ethers } from 'ethers'

const InputDataDecoder = require('ethereum-input-data-decoder')

// eslint-disable-next-line @typescript-eslint/no-var-requires
// import abiDecoder from 'abi-decoder'
// todo: figure out how env vars actually work in CI
// const TEST_PRIVATE_KEY = Cypress.env('INTEGRATION_TEST_PRIVATE_KEY')
const TEST_PRIVATE_KEY = '0xe580410d7c37d26c6ad1a837bbae46bc27f9066a466fb3a66e770523b4666d19'

// address of the above key
export const TEST_ADDRESS_NEVER_USE = new Wallet(TEST_PRIVATE_KEY).address

export const TEST_ADDRESS_NEVER_USE_SHORTENED = truncateAddress(TEST_ADDRESS_NEVER_USE)

function decodeEthCall(abi, input) {
  const decoder = new InputDataDecoder(abi)
  return decoder.decodeData(input)
}

function encodeEthResult(abi, funcName, result) {
  const iface = new ethers.utils.Interface(abi)
  return iface.encodeFunctionResult(funcName, result)
}

const FAKE_BLOCK_HASH = '0xeed54f1dd0adad878c624694038ac3c70631ec800b150b9caf9eedd4aea3df95'

function isTheSameAddress(address1, address2) {
  return address1.toLowerCase() === address2.toLowerCase()
}

export class CustomizedBridge extends Eip1193Bridge {
  chainId = SupportedChainId.FANTOM

  async sendAsync(...args) {
    console.debug('sendAsync called', ...args)
    return this.send(...args)
  }

  getSendArgs(args) {
    console.debug('send called', ...args)
    const isCallbackForm = typeof args[0] === 'object' && typeof args[1] === 'function'
    let callback
    let method
    let params
    if (isCallbackForm) {
      callback = args[1]
      method = args[0].method
      params = args[0].params
    } else {
      method = args[0]
      params = args[1]
    }
    return {
      isCallbackForm,
      callback,
      method,
      params,
    }
  }

  async send(...args) {
    const { isCallbackForm, callback, method, params } = this.getSendArgs(args)
    if (method === 'eth_requestAccounts' || method === 'eth_accounts') {
      if (isCallbackForm) {
        callback({ result: [TEST_ADDRESS_NEVER_USE] })
      } else {
        return Promise.resolve([TEST_ADDRESS_NEVER_USE])
      }
    }
    if (method === 'eth_chainId') {
      if (isCallbackForm) {
        callback(null, { result: formatChainId(String(this.chainId)) })
      } else {
        return Promise.resolve(formatChainId(String(this.chainId)))
      }
    }
    try {
      const result = await super.send(method, params)
      if (isCallbackForm) {
        callback(null, { result })
      } else {
        return result
      }
    } catch (error) {
      console.log({ isCallbackForm, callback, method, params })

      if (isCallbackForm) {
        callback(error, null)
      } else {
        throw error
      }
    }
  }
}

export class ZeroBalanceVenftBridge extends CustomizedBridge {
  VeNFTBalanceOf(decodedInput, setResult) {
    const [_owner] = decodedInput
    const result = encodeEthResult(VENFT_ABI, 'balanceOf', [0])
    setResult(result)
  }

  async send(...args) {
    const { isCallbackForm, callback, method, params } = this.getSendArgs(args)

    let result = null
    let resultIsSet = false

    function setResult(r) {
      result = r
      resultIsSet = true
    }

    if (method === 'eth_call') {
      if (isTheSameAddress(params[0].to, veNFT[this.chainId])) {
        const decoded = decodeEthCall(VENFT_ABI, params[0].data)
        if (decoded.method === 'balanceOf') {
          this.VeNFTBalanceOf(decoded.inputs, setResult)
        }
      }
    }

    if (resultIsSet) {
      if (isCallbackForm) {
        callback(null, { result })
      } else {
        return result
      }
    }
    return super.send(...args)
  }
}

export class HasVenftToSellBridge extends CustomizedBridge {
  tokens = [
    {
      tokenId: 32824,
      needsAmount: 1000000000000,
      endTime: 1776902400,
    },
    {
      tokenId: 14278,
      needsAmount: 2000000000000,
      endTime: 1776900400,
    },
  ]

  VeNFTBalanceOf(decodedInput, setResult) {
    const [_owner] = decodedInput
    const result = encodeEthResult(VENFT_ABI, 'balanceOf', [2])
    setResult(result)
  }

  tokenOfOwnerByIndex(decodedInput, setResult) {
    const [_owner, index] = decodedInput
    const token = this.tokens[index.toNumber()]
    const returnData = [token.tokenId]
    const result = encodeEthResult(VENFT_ABI, 'tokenOfOwnerByIndex', returnData)
    setResult(result)
  }

  veNFTLockedData(decodedInput, setResult) {
    const [tokenId] = decodedInput
    const token = this.tokens.find((t) => t.tokenId === tokenId.toNumber())
    const returnData = [token.needsAmount, token.endTime]
    const result = encodeEthResult(VENFT_ABI, 'locked', returnData)
    setResult(result)
  }

  handleMulticall(decodedInput, setResult) {
    const [_requireSuccess, calls] = decodedInput
    const results = []
    calls.forEach((call) => {
      const callAddress = call[0]
      if (isTheSameAddress(callAddress, veNFT[this.chainId])) {
        const decodedCall = decodeEthCall(VENFT_ABI, call[1])
        const setResultLocal = (callResult) => results.push([true, callResult])
        if (decodedCall.method === 'tokenOfOwnerByIndex') {
          this.tokenOfOwnerByIndex(decodedCall.inputs, setResultLocal)
        }
        if (decodedCall.method === 'locked') {
          this.veNFTLockedData(decodedCall.inputs, setResultLocal)
        }
      }
    })
    setResult(encodeEthResult(MULTICALL2_ABI, 'tryBlockAndAggregate', [0, FAKE_BLOCK_HASH, results]))
  }

  async send(...args) {
    const { isCallbackForm, callback, method, params } = this.getSendArgs(args)

    let result = null
    let resultIsSet = false

    function setResult(r) {
      result = r
      resultIsSet = true
    }

    if (method === 'eth_call') {
      if (isTheSameAddress(params[0].to, veNFT[this.chainId])) {
        const decoded = decodeEthCall(VENFT_ABI, params[0].data)
        if (decoded.method === 'balanceOf') {
          this.VeNFTBalanceOf(decoded.inputs, setResult)
        }
      }
      if (isTheSameAddress(params[0].to, Multicall2[this.chainId])) {
        const decoded = decodeEthCall(MULTICALL2_ABI, params[0].data)
        if (decoded.method === 'tryBlockAndAggregate') {
          this.handleMulticall(decoded.inputs, setResult)
        }
      }
    }

    if (resultIsSet) {
      if (isCallbackForm) {
        callback(null, { result })
      } else {
        return result
      }
    }
    return super.send(...args)
  }
}

export const provider = new JsonRpcProvider('https://rpc.ftm.tools/', 250)
export const signer = new Wallet(TEST_PRIVATE_KEY, provider)
