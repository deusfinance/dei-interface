import { BuyVeNFTBridge, provider, signer } from '../support/commands'
import { tokenListSorted } from '../utils/data'
import VAULT_ABI from '../../src/constants/abi/Vault.json'
// @ts-ignore
import { BaseVaultHandler } from '../utils/abihandlers/Vault'
import { SupportedChainId } from '../../src/constants/chains'
import { Vault } from '../../src/constants/addresses'

describe('VeNFT Buy', () => {
  const tokenIndex = 1
  const expectTokenId = tokenListSorted[tokenIndex].tokenId
  const vaultHandler = {
    abi: VAULT_ABI,
    handler: new BaseVaultHandler(),
  }

  it('renders page when wallet is not connected', () => {
    cy.visit('/venft/buy/')
    cy.get('[data-testid=venft-buy-page]')
  })

  function buyVeNFT() {
    cy.wait(500)
    cy.get(`[data-testid=venft-buy-row-${tokenIndex}-token-id]`).contains(expectTokenId)
    cy.get(`[data-testid=venft-buy-row-${tokenIndex}-action]`).click()
    cy.get('[data-testid=explorer-link-success-box]')
    cy.get('[data-testid=explorer-link-success-box-close]').click()
  }

  it('buys veNFT', () => {
    const ethBridge = new BuyVeNFTBridge(signer, provider)
    ethBridge.setHandler(Vault[SupportedChainId.FANTOM], vaultHandler)
    cy.on('window:before:load', (win) => {
      // @ts-ignore
      win.ethereum = ethBridge
      cy.spy(vaultHandler.handler, 'buyVeNFTSpy')
    })

    cy.visit('/venft/buy/')
    buyVeNFT()
    cy.window().then((win) => {
      const expectTokenId = tokenListSorted[tokenIndex].tokenId
      expect(vaultHandler.handler.buyVeNFTSpy).to.have.calledWith(expectTokenId)
    })
  })
})
