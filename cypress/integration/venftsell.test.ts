import {
  CustomizedBridge,
  provider,
  signer,
  TEST_ADDRESS_NEVER_USE,
  TEST_ADDRESS_NEVER_USE_SHORTENED,
  ZeroBalanceVenftBridge,
} from '../support/commands'

describe('Landing Page', () => {
  const setupEthBridge = () => {
    cy.on('window:before:load', (win) => {
      // @ts-ignore
      win.ethereum = new CustomizedBridge(signer, provider)
    })
  }

  it('is connected', () => {
    setupEthBridge()
    cy.visit('/venft/sell/')
    cy.get('[data-cy=wallet-connect]', { timeout: 1000 }).contains(TEST_ADDRESS_NEVER_USE_SHORTENED)
  })

  it('loads VeNFT list', () => {
    const ethBridge = new ZeroBalanceVenftBridge(signer, provider)
    cy.on('window:before:load', (win) => {
      // @ts-ignore
      win.ethereum = ethBridge
      cy.spy(ethBridge, 'VeNFTBalanceOfSpy')
    })

    cy.visit('/venft/sell/')

    cy.wait(1000)
    cy.window().then((win) => {
      expect(ethBridge.VeNFTBalanceOfSpy).to.have.calledWith(TEST_ADDRESS_NEVER_USE)
    })
    cy.get(`[data-testid=venft-sell-no-results]`)
  })
})
