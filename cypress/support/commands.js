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
import { TEST_ADDRESS_NEVER_USE, TEST_PRIVATE_KEY, veNFTTokens, ZERO_ADDRESS } from '../utils/data'
import BigNumber from 'bignumber.js'
import {
  FAKE_BLOCK_HASH,
  fakeBlockByNumberResponse,
  fakeTransactionByHashResponse,
  fakeTransactionReceipt,
  latestBlock,
} from '../utils/fake_tx_data'

const InputDataDecoder = require('ethereum-input-data-decoder')

function decodeEthCall(abi, input) {
  const decoder = new InputDataDecoder(abi)
  return decoder.decodeData(input)
}

function encodeEthResult(abi, funcName, result) {
  const iface = new ethers.utils.Interface(abi)
  return iface.encodeFunctionResult(funcName, result)
}

function isTheSameAddress(address1, address2) {
  return address1.toLowerCase() === address2.toLowerCase()
}

export class CustomizedBridge extends Eip1193Bridge {
  chainId = SupportedChainId.FANTOM

  latestBlockNumber = 1
  fakeTransactionIndex = 0

  getLatestBlock() {
    this.latestBlockNumber++
    return Object.assign(latestBlock, {
      number: this.latestBlockNumber,
    })
  }

  getFakeTransactionHash() {
    return ethers.utils.keccak256([this.fakeTransactionIndex++])
  }

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
    if (method === 'eth_getBlockByNumber') {
      if (params[0] === 'latest') {
        const result = this.getLatestBlock()
        if (isCallbackForm) {
          callback(null, { result })
        } else {
          return result
        }
      }
    }
    if (method === 'eth_getTransactionByHash') {
      const [transactionHash] = params
      const result = Object.assign(fakeTransactionByHashResponse, {
        hash: transactionHash,
      })
      if (isCallbackForm) {
        callback(null, { result })
      } else {
        return result
      }
    }
    if (method === 'eth_getTransactionReceipt') {
      const [transactionHash] = params
      const latestBlock = this.getLatestBlock()
      const result = Object.assign(fakeTransactionReceipt, {
        transactionHash,
        blockHash: latestBlock.hash,
        blockNumber: latestBlock.number,
        logs: fakeTransactionReceipt.logs.map((log) => Object.assign(log, transactionHash)),
      })
      if (isCallbackForm) {
        callback(null, { result })
      } else {
        return result
      }
    }
    if (method === 'eth_getBlockByNumber') {
      const [blockNumber, returnFullHashes] = params
      const result = Object.assign(fakeBlockByNumberResponse, {
        number: new BigNumber(blockNumber).toNumber(),
      })
      if (isCallbackForm) {
        callback(null, { result })
      } else {
        return result
      }
    }
    if (method === 'eth_blockNumber') {
      const result = this.getLatestBlock().number
      if (isCallbackForm) {
        callback(null, { result })
      } else {
        return result
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
  withdrawFsolidTokenId = 0

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

  setWithdrawFsolidTokenId(tokenId) {
    this.withdrawFsolidTokenId = tokenId
  }

  withdrawPendingId(_decodedInput, setResult) {
    const returnData = [this.withdrawFsolidTokenId]
    const result = encodeEthResult(VAULT_ABI, 'withdrawPendingId', returnData)
    setResult(result)
  }

  ownerToId(_decodedInput, setResult) {
    const returnData = [0]
    const result = encodeEthResult(VAULT_ABI, 'ownerToId', returnData)
    setResult(result)
  }

  lockPendingId(_decodedInput, setResult) {
    const returnData = [0]
    const result = encodeEthResult(VAULT_ABI, 'lockPendingId', returnData)
    setResult(result)
  }

  getCollateralAmount(decodedInput, setResult) {
    const [tokenId] = decodedInput
    const token = this.tokens.find((t) => t.tokenId === tokenId.toNumber())
    const returnData = [token?.needsAmount || 0]
    const result = encodeEthResult(VAULT_ABI, 'getCollateralAmount', returnData)
    setResult(result)
  }

  withdrawFSolid(_decodedInput, setResult) {
    const result = this.getFakeTransactionHash()
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
        if (decodedCall.method === 'balanceOf') {
          this.VeNFTBalanceOf(decodedCall.inputs, setResultLocal)
        }
        if (decodedCall.method === 'getApproved') {
          this.getApproved(decodedCall.inputs, setResultLocal)
        }
        if (decodedCall.method === 'isApprovedForAll') {
          this.isApprovedForAll(decodedCall.inputs, setResultLocal)
        }
        if (decodedCall.method === 'approve') {
          this.approve(decodedCall.inputs, setResultLocal)
        }
      }
      if (isTheSameAddress(callAddress, Vault[this.chainId])) {
        const decodedCall = decodeEthCall(VAULT_ABI, callInput)
        const setResultLocal = (callResult) => results.push([true, callResult])
        if (decodedCall.method === 'withdrawPendingId') {
          this.withdrawPendingId(decodedCall.inputs, setResultLocal)
        }
        if (decodedCall.method === 'ownerToId') {
          this.ownerToId(decodedCall.inputs, setResultLocal)
        }
        if (decodedCall.method === 'lockPendingId') {
          this.lockPendingId(decodedCall.inputs, setResultLocal)
        }
        if (decodedCall.method === 'getCollateralAmount') {
          this.getCollateralAmount(decodedCall.inputs, setResultLocal)
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

    if (method === 'eth_call' || method === 'eth_sendTransaction') {
      if (isTheSameAddress(params[0].to, Multicall2[this.chainId])) {
        const decoded = decodeEthCall(MULTICALL2_ABI, params[0].data)
        if (decoded.method === 'tryBlockAndAggregate') {
          this.handleMulticall(decoded.inputs, setResult)
        }
      }
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

  setBridgeTokens(newTokens) {
    this.tokens = newTokens
  }

  approveSpy(approvedAddress, tokenId) {}

  approve(decodedInput, setResult) {
    const [_approved, _tokenId] = decodedInput
    this.approveSpy(`0x${_approved}`, _tokenId.toNumber())
    const result = this.getFakeTransactionHash()
    setResult(result)
  }

  getApproved(decodedInput, setResult) {
    const [tokenId] = decodedInput
    const token = this.tokens.find((t) => t.tokenId === tokenId.toNumber())
    const returnData = [token?.approved || ZERO_ADDRESS]
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
    const returnData = [token?.tokenId || 0]
    const result = encodeEthResult(VENFT_ABI, 'tokenOfOwnerByIndex', returnData)
    setResult(result)
  }

  veNFTLockedData(decodedInput, setResult) {
    const [tokenId] = decodedInput
    const token = this.tokens.find((t) => t.tokenId === tokenId.toNumber())
    const returnData = [token?.needsAmount || 0, token?.endTime || 0]
    const result = encodeEthResult(VENFT_ABI, 'locked', returnData)
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
    const result = this.getFakeTransactionHash()
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
        if (decoded.method === 'ownerToId') {
          this.ownerToId(decoded.inputs, setResult)
        }
        if (decoded.method === 'lockPendingId') {
          this.lockPendingId(decoded.inputs, setResult)
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

export const provider = new JsonRpcProvider('https://rpc.ftm.tools/', 250)
export const signer = new Wallet(TEST_PRIVATE_KEY, provider)
