import { provider, SellVeNFTBridge, signer } from '../support/commands'
import { tokenListSorted } from '../utils/data'

describe('VeNFT Sell', () => {
  it('sells VeNFT', () => {
    const ethBridge = new SellVeNFTBridge(signer, provider)
    cy.on('window:before:load', (win) => {
      // @ts-ignore
      win.ethereum = ethBridge
      cy.spy(ethBridge, 'sellVeNFTSpy')
    })

    cy.visit('/venft/sell/')
    const expectTokenId = tokenListSorted[1].tokenId
    cy.get(`[data-testid=venft-sell-row-1-action]`).contains('Sell')
    cy.get(`[data-testid=venft-sell-row-1-action]`).click()
    cy.wait(500)
    cy.window().then((win) => {
      expect(ethBridge.sellVeNFTSpy).to.have.calledWith(expectTokenId)
    })
    cy.get('[data-testid=explorer-link-success-box]')
  })
})
