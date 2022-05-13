import { getCustomizedBridge } from '../utils/ethbridge/customizedbridge'
import { tokenListSorted } from '../utils/data'
// @ts-ignore
import { getVaultHandler } from '../utils/ethbridge/abihandlers/Vault'
import { SupportedChainId } from '../../src/constants/chains'
import { Multicall2, Vault } from '../../src/constants/addresses'
import { getMulticallHandler } from '../utils/ethbridge/abihandlers/Multicall'

describe('render VeNFT Buy Page', () => {
  it('renders page when wallet is not connected', () => {
    cy.visit('/venft/buy/')
    cy.get('[data-testid=venft-buy-page]')
  })
})

describe('VeNFT Buy', () => {
  const ethBridge = getCustomizedBridge()

  beforeEach(() => {
    cy.on('window:before:load', (win) => {
      // @ts-ignore
      win.ethereum = ethBridge
    })
    ethBridge.setHandler(Multicall2[SupportedChainId.FANTOM], getMulticallHandler())
  })

  const tokenIndex = 1
  const expectTokenId = tokenListSorted[tokenIndex].tokenId

  function buyVeNFT() {
    cy.wait(500)
    cy.get(`[data-testid=venft-buy-row-${tokenIndex}-token-id]`).contains(expectTokenId)
    cy.get(`[data-testid=venft-buy-row-${tokenIndex}-action]`).click()
    cy.get('[data-testid=explorer-link-success-box]')
    cy.get('[data-testid=explorer-link-success-box-close]').click()
  }

  it('buys veNFT', () => {
    const vaultHandler = getVaultHandler()
    ethBridge.setHandler(Vault[SupportedChainId.FANTOM], vaultHandler)
    cy.spy(vaultHandler.handler, 'buyVeNFTSpy')

    cy.visit('/venft/buy/')
    buyVeNFT()
    cy.window().then((win) => {
      expect(vaultHandler.handler.buyVeNFTSpy).to.have.calledWith(expectTokenId)
    })
  })
})
