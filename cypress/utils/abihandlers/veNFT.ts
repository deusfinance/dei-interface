import { veNFTTokens, ZERO_ADDRESS } from '../data'

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

  async balanceOf(context: any, decodedInput: any) {
    const [_owner] = decodedInput
    return [this.tokens.length]
  }

  async getApproved(context: any, decodedInput: any) {
    const [tokenId] = decodedInput
    const token = this.tokens.find((t) => t.tokenId === tokenId.toNumber())
    return [token?.approved || ZERO_ADDRESS]
  }

  async isApprovedForAll(context: any, decodedInput: any) {
    const [_owner, _operator] = decodedInput
    return [false]
  }

  async tokenOfOwnerByIndex(context: any, decodedInput: any) {
    const [_owner, index] = decodedInput
    const token = this.tokens[index.toNumber()]
    return [token?.tokenId || 0]
  }

  async locked(context: any, decodedInput: any) {
    const [tokenId] = decodedInput
    const token = this.tokens.find((t) => t.tokenId === tokenId.toNumber())
    return [token?.needsAmount || 0, token?.endTime || 0]
  }

  approveSpy(approvedAddress: string, tokenId: number) {}

  async approve(context: any, decodedInput: any) {
    const [_approved, _tokenId] = decodedInput
    this.approveSpy(`0x${_approved}`, _tokenId.toNumber())
    await sleep(500)
  }
}

export class ZeroBalanceVeNFTHandler extends BaseVeNFTHandler {
  async balanceOf(context: any, decodedInput: any) {
    const [_owner] = decodedInput
    return [0]
  }
}

export class ApprovedAllVeNFTHandler extends BaseVeNFTHandler {
  async isApprovedForAll(context: any, decodedInput: any) {
    const [_owner, _operator] = decodedInput
    return [true]
  }
}
