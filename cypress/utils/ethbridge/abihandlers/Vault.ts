import { veNFTTokens } from '../../data'
import { BigNumber } from '@ethersproject/bignumber/lib.esm'
import VAULT_ABI from '../../../../src/constants/abi/Vault.json'
import { CustomizedBridgeContext } from '../customizedbridge'

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export class BaseVaultHandler {
  tokens = veNFTTokens
  withdrawFsolidTokenId = 0
  lockPendingTokenId = 0

  setBridgeTokens(newTokens: any) {
    this.tokens = newTokens
  }

  buyVeNFTSpy(tokenId: number) {}

  sellVeNFTSpy(tokenId: number) {}

  async sell(context: CustomizedBridgeContext, decodedInput: [BigNumber]) {
    const [tokenId] = decodedInput
    this.sellVeNFTSpy(tokenId.toNumber())
    await sleep(500)
  }

  async buy(context: CustomizedBridgeContext, decodedInput: [BigNumber]) {
    const [tokenId] = decodedInput
    this.buyVeNFTSpy(tokenId.toNumber())
  }

  async setWithdrawFsolidTokenId(tokenId: number) {
    this.withdrawFsolidTokenId = tokenId
  }

  async setLockPendingTokenId(tokenId: number) {
    this.lockPendingTokenId = tokenId
  }

  async withdrawPendingId(context: CustomizedBridgeContext, decodedInput: any) {
    return [this.withdrawFsolidTokenId]
  }

  async ownerToId(context: CustomizedBridgeContext, decodedInput: any) {
    return [0]
  }

  async lockPendingId(context: CustomizedBridgeContext, decodedInput: any) {
    return [this.lockPendingTokenId]
  }

  async getCollateralAmount(context: CustomizedBridgeContext, decodedInput: [BigNumber]) {
    const [tokenId] = decodedInput
    const token = this.tokens.find((t) => t.tokenId === tokenId.toNumber())
    return [token?.needsAmount || 0]
  }

  async withdraw(context: CustomizedBridgeContext, _decodedInput: []) {
    await sleep(500)
  }

  depositVeNFTSpy(tokenId: number) {}

  async deposit(context: CustomizedBridgeContext, decodedInput: [BigNumber]) {
    const [tokenId] = decodedInput
    this.depositVeNFTSpy(tokenId.toNumber())
    await sleep(500)
  }
}

export const getVaultHandler = () => ({
  abi: VAULT_ABI,
  handler: new BaseVaultHandler(),
})
