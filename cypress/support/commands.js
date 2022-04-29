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
import { veNFT } from '../../src/constants/addresses'
import VENFT_ABI from '../../src/constants/abi/veNFT.json'
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

function decodeEthCall(data, abi) {
  const decoder = new InputDataDecoder(abi)
  return decoder.decodeData(data)
}

function encodeEthResult(abi, funcName, params) {
  const iface = new ethers.utils.Interface(abi)
  return iface.encodeFunctionResult(funcName, params)
}

export class CustomizedBridge extends Eip1193Bridge {
  chainId = SupportedChainId.FANTOM

  VeNFTBalanceOfSpy(address) {}

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

    if (method === 'eth_call') {
      if (params[0].to === veNFT[this.chainId]) {
        const decoded = decodeEthCall(params[0].data, VENFT_ABI)
        if (decoded.method === 'balanceOf') {
          this.VeNFTBalanceOfSpy(`0x${decoded.inputs[0]}`)
          const result = encodeEthResult(VENFT_ABI, 'balanceOf', [0])
          if (isCallbackForm) {
            callback(null, { result })
          } else {
            return result
          }
        }
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

export const provider = new JsonRpcProvider('https://rpc.ftm.tools/', 250)
export const signer = new Wallet(TEST_PRIVATE_KEY, provider)
