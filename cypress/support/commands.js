// ***********************************************
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

import { Eip1193Bridge } from '@ethersproject/experimental/lib/eip1193-bridge'
import { JsonRpcProvider } from '@ethersproject/providers'
import { Wallet } from '@ethersproject/wallet'
import { formatChainId } from '../../src/utils/account'
import { SupportedChainId } from '../../src/constants/chains'
import { Multicall2, Vault, veNFT } from '../../src/constants/addresses'
import VENFT_ABI from '../../src/constants/abi/veNFT.json'
import VAULT_ABI from '../../src/constants/abi/Vault.json'
import MULTICALL2_ABI from '../../src/constants/abi/MULTICALL2.json'

import { ethers } from 'ethers'
import { TEST_ADDRESS_NEVER_USE, TEST_PRIVATE_KEY, tokenListSorted, veNFTTokens } from '../utils/data'

const InputDataDecoder = require('ethereum-input-data-decoder')

function decodeEthCall(abi, input) {
  const decoder = new InputDataDecoder(abi)
  return decoder.decodeData(input)
}

function encodeEthResult(abi, funcName, result) {
  const iface = new ethers.utils.Interface(abi)
  return iface.encodeFunctionResult(funcName, result)
}

const FAKE_BLOCK_HASH = '0xeed54f1dd0adad878c624694038ac3c70631ec800b150b9caf9eedd4aea3df95'
const FAKE_TRANSACTION_HASH = {
  [SupportedChainId.FANTOM]: '0x8c417b4770b68fed1dd27c6aa3c5a399910f6d8f20630b3a588ab8141d5bff43',
}

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
    if (method === 'eth_estimateGas') {
      const result = '0xba7f'
      if (isCallbackForm) {
        callback(null, { result })
      } else {
        return Promise.resolve(result)
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

export class AbstractVeNFTBridge extends CustomizedBridge {
  VeNFTBalanceOf(decodedInput, setResult) {
    throw 'Not implemented'
  }

  getApproved(decodedInput, setResult) {
    throw 'Not implemented'
  }

  isApprovedForAll(decodedInput, setResult) {
    throw 'Not implemented'
  }

  approve(decodedInput, setResult) {
    throw 'Not implemented'
  }

  async send(...args) {
    const { isCallbackForm, callback, method, params } = this.getSendArgs(args)

    let result = null
    let resultIsSet = false

    function setResult(r) {
      result = r
      resultIsSet = true
    }

    if (method === 'eth_call' || method === 'eth_sendTransaction') {
      if (isTheSameAddress(params[0].to, veNFT[this.chainId])) {
        const decoded = decodeEthCall(VENFT_ABI, params[0].data)
        if (decoded.method === 'balanceOf') {
          this.VeNFTBalanceOf(decoded.inputs, setResult)
        }
        if (decoded.method === 'getApproved') {
          this.getApproved(decoded.inputs, setResult)
        }
        if (decoded.method === 'isApprovedForAll') {
          this.isApprovedForAll(decoded.inputs, setResult)
        }
        if (decoded.method === 'approve') {
          this.approve(decoded.inputs, setResult)
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

export class ZeroBalanceVeNFTBridge extends AbstractVeNFTBridge {
  VeNFTBalanceOf(decodedInput, setResult) {
    const [_owner] = decodedInput
    const result = encodeEthResult(VENFT_ABI, 'balanceOf', [0])
    setResult(result)
  }
}

export class HasVeNFTToSellBridge extends AbstractVeNFTBridge {
  tokens = veNFTTokens

  approveSpy(approvedAddress, tokenId) {}

  approve(decodedInput, setResult) {
    const [_approved, _tokenId] = decodedInput
    this.approveSpy(`0x${_approved}`, _tokenId.toNumber())
    const result = FAKE_TRANSACTION_HASH[this.chainId]
    setResult(result)
  }

  getApproved(decodedInput, setResult) {
    const [tokenId] = decodedInput
    const token = this.tokens.find((t) => t.tokenId === tokenId.toNumber())
    const returnData = [token.approved]
    const result = encodeEthResult(VENFT_ABI, 'getApproved', returnData)
    setResult(result)
  }

  isApprovedForAll(decodedInput, setResult) {
    const [_owner, _operator] = decodedInput
    const returnData = [false]
    const result = encodeEthResult(VENFT_ABI, 'isApprovedForAll', returnData)
    setResult(result)
  }

  VeNFTBalanceOf(decodedInput, setResult) {
    const [_owner] = decodedInput
    const result = encodeEthResult(VENFT_ABI, 'balanceOf', [this.tokens.length])
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
      const [callAddress, callInput] = call
      if (isTheSameAddress(callAddress, veNFT[this.chainId])) {
        const decodedCall = decodeEthCall(VENFT_ABI, callInput)
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

export class HasVeNFTToSellApprovedAllBridge extends HasVeNFTToSellBridge {
  isApprovedForAll(decodedInput, setResult) {
    const [_owner, _operator] = decodedInput
    const returnData = [true]
    const result = encodeEthResult(VENFT_ABI, 'isApprovedForAll', returnData)
    setResult(result)
  }
}

export class SellVeNFTBridge extends HasVeNFTToSellApprovedAllBridge {
  sellVeNFTSpy(tokenId) {}

  sellVeNFT(decodedInput, setResult) {
    const [tokenId] = decodedInput
    this.sellVeNFTSpy(tokenId.toNumber())
    const result = FAKE_TRANSACTION_HASH[this.chainId]
    setResult(result)
  }

  withdrawPendingId(_decodedInput, setResult) {
    const returnData = [0]
    const result = encodeEthResult(VAULT_ABI, 'withdrawPendingId', returnData)
    setResult(result)
  }

  getCollateralAmount(decodedInput, setResult) {
    const [tokenId] = decodedInput
    const token = this.tokens.find((t) => t.tokenId === tokenId.toNumber())
    const returnData = [token.needsAmount]
    const result = encodeEthResult(VAULT_ABI, 'getCollateralAmount', returnData)
    setResult(result)
  }

  withdrawFSolid(_decodedInput, setResult) {
    const result = FAKE_TRANSACTION_HASH[this.chainId]
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

    if (method === 'eth_call' || method === 'eth_sendTransaction') {
      if (isTheSameAddress(params[0].to, Vault[this.chainId])) {
        const decoded = decodeEthCall(VAULT_ABI, params[0].data)
        if (decoded.method === 'sell') {
          this.sellVeNFT(decoded.inputs, setResult)
        }
        if (decoded.method === 'withdrawPendingId') {
          this.withdrawPendingId(decoded.inputs, setResult)
        }
        if (decoded.method === 'getCollateralAmount') {
          this.getCollateralAmount(decoded.inputs, setResult)
        }
        if (decoded.method === 'withdraw') {
          this.withdrawFSolid(decoded.inputs, setResult)
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

export class WithdrawVeNFTBridge extends SellVeNFTBridge {
  withdrawPendingId(_decodedInput, setResult) {
    const returnData = [tokenListSorted[1].tokenId]
    const result = encodeEthResult(VAULT_ABI, 'withdrawPendingId', returnData)
    setResult(result)
  }
}

export const provider = new JsonRpcProvider('https://rpc.ftm.tools/', 250)
export const signer = new Wallet(TEST_PRIVATE_KEY, provider)
