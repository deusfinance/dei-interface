import { getCustomizedBridge } from '../support/commands'
import { tokenListSorted } from '../utils/data'
// @ts-ignore
import { vaultHandler } from '../utils/abihandlers/Vault'
import { SupportedChainId } from '../../src/constants/chains'
import { Multicall2, Vault } from '../../src/constants/addresses'
import { multicallHandler } from '../utils/abihandlers/Multicall'

describe('render VeNFT Buy Page', () => {
  it('renders page when wallet is not connected', () => {
    cy.visit('/venft/buy/')
    cy.get('[data-testid=venft-buy-page]')
  })
})

describe('VeNFT Buy', () => {
  const tokenIndex = 1
  const expectTokenId = tokenListSorted[tokenIndex].tokenId
  const ethBridge = getCustomizedBridge()

  beforeEach(() => {
    cy.on('window:before:load', (win) => {
      // @ts-ignore
      win.ethereum = ethBridge
    })
    ethBridge.setHandler(Multicall2[SupportedChainId.FANTOM], multicallHandler)
    ethBridge.setHandler(Vault[SupportedChainId.FANTOM], vaultHandler)
  })

  function buyVeNFT() {
    cy.wait(500)
    cy.get(`[data-testid=venft-buy-row-${tokenIndex}-token-id]`).contains(expectTokenId)
    cy.get(`[data-testid=venft-buy-row-${tokenIndex}-action]`).click()
    cy.get('[data-testid=explorer-link-success-box]')
    cy.get('[data-testid=explorer-link-success-box-close]').click()
  }

  it('buys veNFT', () => {
    cy.spy(vaultHandler.handler, 'buyVeNFTSpy')

    cy.visit('/venft/buy/')
    buyVeNFT()
    cy.window().then((win) => {
      expect(vaultHandler.handler.buyVeNFTSpy).to.have.calledWith(expectTokenId)
    })
  })
})
