import { provider, SellVeNFTBridge, signer } from '../support/commands'
import { tokenListSorted } from '../utils/data'

describe('VeNFT Sell', () => {
  const tokenIndex = 1
  const expectTokenId = tokenListSorted[tokenIndex].tokenId
  const veNFTTokensAfterSell = [...tokenListSorted].splice(1)

  function sellVeNFT() {
    cy.wait(500)
    cy.get(`[data-testid=venft-fsolid-withdraw]`).should('not.exist')
    cy.get(`[data-testid=venft-sell-row-${tokenIndex}-token-id]`).contains(expectTokenId)
    cy.get(`[data-testid=venft-sell-row-${tokenIndex}-action]`).contains('Sell')
    cy.window().then((win) => {
      // @ts-ignore
      win.ethereum.setWithdrawFsolidTokenId(expectTokenId)
      // @ts-ignore
      win.ethereum.setBridgeTokens(veNFTTokensAfterSell)
    })
    cy.get(`[data-testid=venft-sell-row-${tokenIndex}-action]`).click()
    cy.get('[data-testid=explorer-link-success-box]')
    cy.get('[data-testid=explorer-link-success-box-close]').click()
  }

  function withdrawFSolid() {
    cy.get(`[data-testid=venft-fsolid-withdraw]`).should('exist')
    cy.get(`[data-testid=venft-fsolid-withdraw-token-id]`).contains(expectTokenId)
    cy.get(`[data-testid=venft-fsolid-withdraw-amount]`).should('exist')
    cy.window().then((win) => {
      // @ts-ignore
      win.ethereum.setWithdrawFsolidTokenId(0)
    })
    cy.get(`[data-testid=venft-fsolid-withdraw-action]`).click()
    cy.get('[data-testid=explorer-link-success-box]')
    cy.get('[data-testid=explorer-link-success-box-close]').click()
    cy.window().then((win) => {
      // @ts-ignore
      expect(win.ethereum.withdrawFSolid).to.have.callCount(1)
    })
    cy.get(`[data-testid=venft-fsolid-withdraw]`).should('not.exist')
  }

  it('sells veNFT', () => {
    const ethBridge = new SellVeNFTBridge(signer, provider)
    cy.on('window:before:load', (win) => {
      ethBridge.setWithdrawFsolidTokenId(0)
      // @ts-ignore
      win.ethereum = ethBridge
      cy.spy(ethBridge, 'sellVeNFTSpy')
    })

    cy.visit('/venft/sell/')
    sellVeNFT()
    cy.window().then((win) => {
      const expectTokenId = tokenListSorted[tokenIndex].tokenId
      expect(ethBridge.sellVeNFTSpy).to.have.calledWith(expectTokenId)
    })
  })

  it('withdraws fsolid after selling veNFT', () => {
    const ethBridge = new SellVeNFTBridge(signer, provider)
    cy.on('window:before:load', (win) => {
      ethBridge.setWithdrawFsolidTokenId(expectTokenId)
      // @ts-ignore
      win.ethereum = ethBridge
      cy.spy(ethBridge, 'withdrawFSolid')
    })
    cy.visit('/venft/sell/')
    withdrawFSolid()
  })

  it('sells veNFT and withdraws fsolid', () => {
    const ethBridge = new SellVeNFTBridge(signer, provider)
    cy.on('window:before:load', (win) => {
      ethBridge.setWithdrawFsolidTokenId(0)
      // @ts-ignore
      win.ethereum = ethBridge
      cy.spy(ethBridge, 'withdrawFSolid')
      cy.spy(ethBridge, 'sellVeNFTSpy')
    })
    cy.visit('/venft/sell/')
    sellVeNFT()
    withdrawFSolid()
    // one token is sold and removed, so
    cy.get(`[data-testid=venft-sell-row-${tokenListSorted.length - 1}-token-id]`).should('not.exist')
  })
})
