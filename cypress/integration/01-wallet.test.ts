import { TEST_ADDRESS_NEVER_USE_SHORTENED } from '../utils/data'
import { getCustomizedBridge } from '../utils/ethbridge/customizedbridge'

describe('Wallet', () => {
  const ethBridge = getCustomizedBridge()

  it('is connected', () => {
    cy.on('window:before:load', (win) => {
      // @ts-ignore
      win.ethereum = ethBridge
    })
    cy.visit('/')
    cy.get('[data-testid=wallet-connect]').contains(TEST_ADDRESS_NEVER_USE_SHORTENED)
  })
})
