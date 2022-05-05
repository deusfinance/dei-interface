import { provider, SellVeNFTBridge, signer } from '../support/commands'
import { tokenListSorted } from '../utils/data'

describe('VeNFT Sell', () => {
  function sellVeNFT(tokenIndex: number) {
    cy.wait(500)
    cy.get(`[data-testid=venft-fsolid-withdraw]`).should('not.exist')
    cy.get(`[data-testid=venft-sell-row-${tokenIndex}-action]`).contains('Sell')
    cy.get(`[data-testid=venft-sell-row-${tokenIndex}-action]`).click()
    cy.get('[data-testid=explorer-link-success-box]')
  }

  it.only('sells veNFT', () => {
    const tokenIndex = 1
    const ethBridge = new SellVeNFTBridge(signer, provider)
    cy.on('window:before:load', (win) => {
      ethBridge.setWithdrawFsolidTokenId(0)
      // @ts-ignore
      win.ethereum = ethBridge
      cy.spy(ethBridge, 'sellVeNFTSpy')
    })

    cy.visit('/venft/sell/')
    sellVeNFT(tokenIndex)
    cy.window().then((win) => {
      const expectTokenId = tokenListSorted[tokenIndex].tokenId
      expect(ethBridge.sellVeNFTSpy).to.have.calledWith(expectTokenId)
    })
  })

  it('withdraws fsolid after selling veNFT', () => {
    const expectTokenId = tokenListSorted[1].tokenId
    const ethBridge = new SellVeNFTBridge(signer, provider)
    cy.on('window:before:load', (win) => {
      ethBridge.setWithdrawFsolidTokenId(expectTokenId)
      // @ts-ignore
      win.ethereum = ethBridge
      cy.spy(ethBridge, 'withdrawFSolid')
    })
    cy.visit('/venft/sell/')
    cy.get(`[data-testid=venft-fsolid-withdraw]`).should('exist')
    cy.get(`[data-testid=venft-fsolid-withdraw-token-id]`).contains(expectTokenId)
    cy.get(`[data-testid=venft-fsolid-withdraw-amount]`).should('exist')
    cy.window().then((win) => {
      ethBridge.setWithdrawFsolidTokenId(0)
    })
    cy.get(`[data-testid=venft-fsolid-withdraw-action]`).click()
    cy.get('[data-testid=explorer-link-success-box]')
    cy.window().then((win) => {
      expect(ethBridge.withdrawFSolid).to.have.callCount(1)
    })
    cy.get(`[data-testid=venft-fsolid-withdraw]`).should('not.exist')
  })

  it('sells veNFT and withdraws fsolid', () => {
    const tokenIndex = 1
    const expectTokenId = tokenListSorted[tokenIndex].tokenId

    const ethBridge = new SellVeNFTBridge(signer, provider)
    cy.on('window:before:load', (win) => {
      ethBridge.setWithdrawFsolidTokenId(0)
      // @ts-ignore
      win.ethereum = ethBridge
      cy.spy(ethBridge, 'withdrawFSolid')
      cy.spy(ethBridge, 'sellVeNFTSpy')
    })
    cy.visit('/venft/sell/')
    cy.wait(500)
    cy.get(`[data-testid=venft-fsolid-withdraw]`).should('not.exist')
    cy.get(`[data-testid=venft-sell-row-${tokenIndex}-action]`).contains('Sell')
    cy.get(`[data-testid=venft-sell-row-${tokenIndex}-action]`).click()
    cy.window().then((win) => {
      expect(ethBridge.sellVeNFTSpy).to.have.calledWith(expectTokenId)
      ethBridge.setWithdrawFsolidTokenId(expectTokenId)
    })
    cy.get('[data-testid=explorer-link-success-box]')
    cy.get(`[data-testid=venft-fsolid-withdraw]`).should('exist')
    cy.get(`[data-testid=venft-fsolid-withdraw-token-id]`).contains(expectTokenId)
    cy.get(`[data-testid=venft-fsolid-withdraw-amount]`).should('exist')
    cy.get(`[data-testid=venft-fsolid-withdraw-action]`).click()
    cy.get('[data-testid=explorer-link-success-box]')
    cy.window().then((win) => {
      expect(ethBridge.withdrawFSolid).to.have.callCount(1)
    })
  })
})
