import { provider, signer, ZeroBalanceVeNFTBridge } from '../support/commands'
import { TEST_ADDRESS_NEVER_USE_SHORTENED } from '../utils/data'

describe('Wallet', () => {
  const setupEthBridge = () => {
    cy.on('window:before:load', (win) => {
      // @ts-ignore
      win.ethereum = new ZeroBalanceVeNFTBridge(signer, provider)
    })
  }

  it('is connected', () => {
    setupEthBridge()
    cy.visit('/')
    cy.get('[data-testid=wallet-connect]', { timeout: 1000 }).contains(TEST_ADDRESS_NEVER_USE_SHORTENED)
  })
})
