import { veNFTTokens } from '../data'
import { BigNumber } from '@ethersproject/bignumber/lib.esm'
import VAULT_ABI from '../../../src/constants/abi/Vault.json'

export class BaseVaultHandler {
  tokens = veNFTTokens
  withdrawFsolidTokenId = 0
  lockPendingTokenId = 0

  setBridgeTokens(newTokens: any) {
    this.tokens = newTokens
  }

  buyVeNFTSpy(tokenId: number) {}

  async buy(context: any, decodedInput: [BigNumber]) {
    const [tokenId] = decodedInput
    this.buyVeNFTSpy(tokenId.toNumber())
  }

  async setWithdrawFsolidTokenId(tokenId: number) {
    this.withdrawFsolidTokenId = tokenId
  }

  async setLockPendingTokenId(tokenId: number) {
    this.lockPendingTokenId = tokenId
  }

  async withdrawPendingId(context: any, decodedInput: any) {
    return [this.withdrawFsolidTokenId]
  }

  async ownerToId(context: any, decodedInput: any) {
    return [0]
  }

  async lockPendingId(context: any, decodedInput: any) {
    return [this.lockPendingTokenId]
  }

  async getCollateralAmount(context: any, decodedInput: [BigNumber]) {
    const [tokenId] = decodedInput
    const token = this.tokens.find((t) => t.tokenId === tokenId.toNumber())
    return [token?.needsAmount || 0]
  }
}

export const getVaultHandler = () => ({
  abi: VAULT_ABI,
  handler: new BaseVaultHandler(),
})
