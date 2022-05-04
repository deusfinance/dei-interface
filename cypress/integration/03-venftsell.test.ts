import { provider, SellVeNFTBridge, signer, WithdrawVeNFTBridge } from '../support/commands'
import { tokenListSorted } from '../utils/data'
import { fromWei } from '../../src/utils/numbers'

describe('VeNFT Sell', () => {
  const sellVenft = (ethBridge: any, tokenId: number) => {
    cy.get(`[data-testid=venft-sell-row-1-action]`).contains('Sell')
    cy.get(`[data-testid=venft-sell-row-1-action]`).click()
    cy.wait(500)
    cy.get('[data-testid=explorer-link-success-box]')
  }
  it('sells VeNFT', () => {
    const ethBridge = new SellVeNFTBridge(signer, provider)
    cy.on('window:before:load', (win) => {
      // @ts-ignore
      win.ethereum = ethBridge
      cy.spy(ethBridge, 'sellVeNFTSpy')
    })

    cy.visit('/venft/sell/')
    cy.wait(500)
    cy.get(`[data-testid=venft-fsolid-withdraw]`).should('not.exist')
    const expectTokenId = tokenListSorted[1].tokenId
    sellVenft(ethBridge, expectTokenId)
    cy.window().then((win) => {
      expect(ethBridge.sellVeNFTSpy).to.have.calledWith(expectTokenId)
    })
  })

  it('withdraws fsolid after selling VeNFT', () => {
    const ethBridge = new WithdrawVeNFTBridge(signer, provider)
    cy.on('window:before:load', (win) => {
      // @ts-ignore
      win.ethereum = ethBridge
      cy.spy(ethBridge, 'withdrawFSolid')
    })
    cy.visit('/venft/sell/')
    cy.get(`[data-testid=venft-fsolid-withdraw]`).should('exist')
    const expectTokenId = tokenListSorted[1].tokenId
    const withdrawAmount = parseFloat(fromWei(tokenListSorted[1].needsAmount))
    cy.get(`[data-testid=venft-fsolid-withdraw-token-id]`).contains(expectTokenId)
    cy.get(`[data-testid=venft-fsolid-withdraw-amount]`).contains(parseFloat(fromWei(withdrawAmount)))
    cy.get(`[data-testid=venft-fsolid-withdraw-action]`).click()
    cy.window().then((win) => {
      expect(ethBridge.withdrawFSolid).to.have.callCount(1)
    })
  })
})
