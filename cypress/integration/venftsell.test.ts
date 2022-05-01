import {
  HasVeNFTToSellApprovedAllBridge,
  HasVeNFTToSellBridge,
  provider,
  signer,
  ZeroBalanceVeNFTBridge,
} from '../support/commands'
import { TEST_ADDRESS_NEVER_USE_SHORTENED, tokenListSorted } from '../utils/data'

describe('Landing Page', () => {
  const setupEthBridge = () => {
    cy.on('window:before:load', (win) => {
      // @ts-ignore
      win.ethereum = new ZeroBalanceVeNFTBridge(signer, provider)
    })
  }

  it('is connected', () => {
    setupEthBridge()
    cy.visit('/venft/sell/')
    cy.get('[data-testid=wallet-connect]', { timeout: 1000 }).contains(TEST_ADDRESS_NEVER_USE_SHORTENED)
  })

  it('gets VeNFT balance', () => {
    const ethBridge = new ZeroBalanceVeNFTBridge(signer, provider)
    cy.on('window:before:load', (win) => {
      // @ts-ignore
      win.ethereum = ethBridge
      cy.spy(ethBridge, 'VeNFTBalanceOf')
    })

    cy.visit('/venft/sell/')

    cy.wait(1000)
    cy.window().then((win) => {
      expect(ethBridge.VeNFTBalanceOf).to.have.callCount(1)
    })
    cy.get(`[data-testid=venft-sell-no-results]`)
  })
  it('loads VeNFT list', () => {
    const ethBridge = new HasVeNFTToSellBridge(signer, provider)
    cy.on('window:before:load', (win) => {
      // @ts-ignore
      win.ethereum = ethBridge
      cy.spy(ethBridge, 'VeNFTBalanceOf')
      cy.spy(ethBridge, 'tokenOfOwnerByIndex')
      cy.spy(ethBridge, 'veNFTLockedData')
    })

    cy.visit('/venft/sell/')
    const expectTokenId = tokenListSorted[1].tokenId
    cy.get(`[data-testid=venft-sell-row-1-token-id]`, { timeout: 2000 }).contains(expectTokenId)
    cy.window().then((win) => {
      expect(ethBridge.VeNFTBalanceOf).to.have.callCount(1)
      expect(ethBridge.tokenOfOwnerByIndex).to.have.callCount(tokenListSorted.length)
      expect(ethBridge.veNFTLockedData).to.have.callCount(tokenListSorted.length)
    })
  })

  it('checks approval for single tokens', () => {
    const ethBridge = new HasVeNFTToSellBridge(signer, provider)
    cy.on('window:before:load', (win) => {
      // @ts-ignore
      win.ethereum = ethBridge
    })
    cy.visit('/venft/sell/')
    cy.get(`[data-testid=venft-sell-row-0-action]`).contains('Sell')
    cy.get(`[data-testid=venft-sell-row-1-action]`).contains('Approve')
    cy.get(`[data-testid=venft-sell-row-2-action]`).contains('Approve')
  })

  it('checks approve all', () => {
    const ethBridge = new HasVeNFTToSellApprovedAllBridge(signer, provider)
    cy.on('window:before:load', (win) => {
      // @ts-ignore
      win.ethereum = ethBridge
    })
    cy.visit('/venft/sell/')
    cy.get(`[data-testid=venft-sell-row-0-action]`).contains('Sell')
    cy.get(`[data-testid=venft-sell-row-1-action]`).contains('Sell')
    cy.get(`[data-testid=venft-sell-row-2-action]`).contains('Approve')
  })

  // it('sells VeNFT', () => {
  //   const ethBridge = new SellVeNFTBridge(signer, provider)
  //   cy.on('window:before:load', (win) => {
  //     // @ts-ignore
  //     win.ethereum = ethBridge
  //     cy.spy(ethBridge, 'sellVeNFTSpy')
  //   })
  //
  //   cy.visit('/venft/sell/')
  //   const expectTokenId = tokenListSorted[1].tokenId
  //   cy.get(`[data-testid=venft-sell-row-1-action]`).contains('Sell')
  //   cy.get(`[data-testid=venft-sell-row-1-action]`).click()
  //   cy.wait(500)
  //   cy.window().then((win) => {
  //     expect(ethBridge.sellVeNFTSpy).to.have.calledWith(expectTokenId)
  //   })
  // })
})
