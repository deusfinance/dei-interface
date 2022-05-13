import { veNFTTokens, ZERO_ADDRESS } from '../../data'
import VENFT_ABI from '../../../../src/constants/abi/veNFT.json'
import { CustomizedBridgeContext } from '../customizedbridge'
import { BigNumber } from '@ethersproject/bignumber'

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export class BaseVeNFTHandler {
  tokens = veNFTTokens
  balance = 0

  setBalance(balance: number) {
    this.balance = balance
  }

  setBridgeTokens(newTokens: any) {
    this.tokens = newTokens
  }

  async balanceOf(context: CustomizedBridgeContext, decodedInput: any) {
    const [_owner] = decodedInput
    return [this.tokens.length]
  }

  async getApproved(context: CustomizedBridgeContext, decodedInput: any) {
    const [tokenId] = decodedInput
    const token = this.tokens.find((t) => t.tokenId === tokenId.toNumber())
    return [token?.approved || ZERO_ADDRESS]
  }

  async isApprovedForAll(context: CustomizedBridgeContext, decodedInput: any) {
    const [_owner, _operator] = decodedInput
    return [false]
  }

  async tokenOfOwnerByIndex(context: CustomizedBridgeContext, decodedInput: any) {
    const [_owner, index] = decodedInput
    const token = this.tokens[index.toNumber()]
    return [token?.tokenId || 0]
  }

  async locked(context: CustomizedBridgeContext, decodedInput: [BigNumber]) {
    const [tokenId] = decodedInput
    const token = this.tokens.find((t) => t.tokenId === tokenId.toNumber())
    return [token?.needsAmount || 0, token?.endTime || 0]
  }

  approveSpy(approvedAddress: string, tokenId: number) {}

  async approve(context: CustomizedBridgeContext, decodedInput: [BigNumber, BigNumber]) {
    const [_approved, tokenId] = decodedInput
    this.approveSpy(`0x${_approved}`, tokenId.toNumber())
    await sleep(500)
  }
}

export class ZeroBalanceVeNFTHandler extends BaseVeNFTHandler {
  async balanceOf(context: CustomizedBridgeContext, decodedInput: any) {
    const [_owner] = decodedInput
    return [0]
  }
}

export class ApprovedAllVeNFTHandler extends BaseVeNFTHandler {
  async isApprovedForAll(context: CustomizedBridgeContext, decodedInput: [BigNumber, BigNumber]) {
    const [_owner, _operator] = decodedInput
    return [true]
  }
}

export const getZeroBalanceVeNFTHandler = () => ({
  abi: VENFT_ABI,
  handler: new ZeroBalanceVeNFTHandler(),
})

export const getVeNFTHandler = () => ({
  abi: VENFT_ABI,
  handler: new BaseVeNFTHandler(),
})

export const getApprovedAllVeNFTHandler = () => ({
  abi: VENFT_ABI,
  handler: new ApprovedAllVeNFTHandler(),
})
