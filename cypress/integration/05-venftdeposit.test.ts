import { DepositVeNFTBridge, provider, SellVeNFTBridge, signer } from '../support/commands'
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
      win.ethereum.setLockPendingTokenId(expectTokenId)
      // @ts-ignore
      win.ethereum.setBridgeTokens(veNFTTokensAfterDeposit)
    })
    cy.get('[data-testid=venft-deposit-loading]').should('not.exist')
    cy.get(`[data-testid=venft-deposit-row-${tokenIndex}-action]`).click()
    cy.get('[data-testid=venft-deposit-loading]').should('exist')
    cy.get('[data-testid=explorer-link-success-box]')
    cy.get('[data-testid=explorer-link-success-box-close]').click()
  }

  function showLockModal() {
    cy.get(`[data-testid=venft-deposit-lock]`).should('exist')
    cy.get(`[data-testid=venft-deposit-lock-token-id]`).contains(expectTokenId)
    cy.window().then((win) => {
      // @ts-ignore
      win.ethereum.setLockPendingTokenId(0)
    })
    cy.get(`[data-testid=venft-deposit-lock-action]`).click()
    cy.url().should('include', expectTokenId)
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

  it('shows vote and lock venft modal', () => {
    const ethBridge = new SellVeNFTBridge(signer, provider)
    cy.on('window:before:load', (win) => {
      ethBridge.setLockPendingTokenId(expectTokenId)
      // @ts-ignore
      win.ethereum = ethBridge
      cy.spy(ethBridge, 'withdrawFSolid')
    })
    cy.visit('/venft/deposit/')
    showLockModal()
  })

  it('deposits and goes for vote page', () => {
    const ethBridge = new DepositVeNFTBridge(signer, provider)
    cy.on('window:before:load', (win) => {
      // @ts-ignore
      win.ethereum = ethBridge
      cy.spy(ethBridge, 'depositVeNFTSpy')
    })

    cy.visit('/venft/deposit/')
    depositVeNFT()
    showLockModal()
  })
})
