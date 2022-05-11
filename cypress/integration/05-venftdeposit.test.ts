import { DepositVeNFTBridge, provider, signer } from '../support/commands'
import { tokenListSorted } from '../utils/data'

describe('VeNFT Deposit', () => {
  const tokenIndex = 1
  const expectTokenId = tokenListSorted[tokenIndex].tokenId
  const veNFTTokensAfterDeposit = [...tokenListSorted].splice(1)

  it('renders page when wallet is not connected', () => {
    cy.visit('/venft/deposit/')
    cy.get('[data-testid=venft-deposit-page]')
  })

  function depositVeNFT() {
    cy.wait(500)
    cy.get(`[data-testid=venft-deposit-row-${tokenIndex}-token-id]`).contains(expectTokenId)
    cy.get(`[data-testid=venft-deposit-row-${tokenIndex}-action]`).contains('Deposit')
    cy.window().then((win) => {
      // @ts-ignore
      win.ethereum.setBridgeTokens(veNFTTokensAfterDeposit)
    })
    cy.get('[data-testid=venft-deposit-loading]').should('not.exist')
    cy.get(`[data-testid=venft-deposit-row-${tokenIndex}-action]`).click()
    cy.get('[data-testid=venft-deposit-loading]').should('exist')
    cy.get('[data-testid=explorer-link-success-box]')
    cy.get('[data-testid=explorer-link-success-box-close]').click()
  }

  it('deposits veNFT', () => {
    const ethBridge = new DepositVeNFTBridge(signer, provider)
    cy.on('window:before:load', (win) => {
      // @ts-ignore
      win.ethereum = ethBridge
      cy.spy(ethBridge, 'depositVeNFTSpy')
    })

    cy.visit('/venft/deposit/')
    depositVeNFT()
    cy.window().then((win) => {
      const expectTokenId = tokenListSorted[tokenIndex].tokenId
      expect(ethBridge.depositVeNFTSpy).to.have.calledWith(expectTokenId)
    })
  })
})
