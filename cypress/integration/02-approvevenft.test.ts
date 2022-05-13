import { getCustomizedBridge } from '../support/commands'
import { tokenListSorted } from '../utils/data'
import { Multicall2, Vault, veNFT } from '../../src/constants/addresses'
import { SupportedChainId } from '../../src/constants/chains'
import { approvedAllVeNFTHandler, veNFTHandler, zeroBalanceVeNFTHandler } from '../utils/abihandlers/veNFT'
import { multicallHandler } from '../utils/abihandlers/Multicall'
import { vaultHandler } from '../utils/abihandlers/Vault'

describe('Approve VeNFT', () => {
  const ethBridge = getCustomizedBridge()

  beforeEach(() => {
    cy.on('window:before:load', (win) => {
      // @ts-ignore
      win.ethereum = ethBridge
    })
    ethBridge.setHandler(Multicall2[SupportedChainId.FANTOM], multicallHandler)
    ethBridge.setHandler(Vault[SupportedChainId.FANTOM], vaultHandler)
  })

  const expectTokenId = tokenListSorted[1].tokenId

  it('gets VeNFT balance', () => {
    ethBridge.setHandler(veNFT[SupportedChainId.FANTOM], zeroBalanceVeNFTHandler)
    cy.spy(zeroBalanceVeNFTHandler.handler, 'balanceOf')

    cy.visit('/venft/sell/')

    cy.wait(1500).then(() => {
      expect(zeroBalanceVeNFTHandler.handler.balanceOf).to.have.callCount(1)
    })
    cy.get(`[data-testid=venft-sell-no-results]`)
  })
  it('loads VeNFT list', () => {
    ethBridge.setHandler(veNFT[SupportedChainId.FANTOM], veNFTHandler)
    cy.spy(veNFTHandler.handler, 'balanceOf')
    cy.spy(veNFTHandler.handler, 'tokenOfOwnerByIndex')
    cy.spy(veNFTHandler.handler, 'locked')

    cy.visit('/venft/sell/')
    cy.get(`[data-testid=venft-sell-row-1-token-id]`)
      .contains(expectTokenId)
      .then(() => {
        expect(veNFTHandler.handler.balanceOf).to.have.callCount(1)
        expect(veNFTHandler.handler.tokenOfOwnerByIndex).to.have.callCount(tokenListSorted.length)
        expect(veNFTHandler.handler.locked).to.have.callCount(tokenListSorted.length)
      })
  })

  it('checks approval for single tokens', () => {
    ethBridge.setHandler(veNFT[SupportedChainId.FANTOM], veNFTHandler)
    cy.visit('/venft/sell/')
    cy.get(`[data-testid=venft-sell-row-0-action]`).contains('Sell')
    cy.get(`[data-testid=venft-sell-row-1-action]`).contains('Approve')
    cy.get(`[data-testid=venft-sell-row-2-action]`).contains('Approve')
  })

  it('checks approve all', () => {
    ethBridge.setHandler(veNFT[SupportedChainId.FANTOM], approvedAllVeNFTHandler)
    cy.visit('/venft/sell/')
    cy.get(`[data-testid=venft-sell-row-0-action]`).contains('Sell')
    cy.get(`[data-testid=venft-sell-row-1-action]`).contains('Sell')
    cy.get(`[data-testid=venft-sell-row-2-action]`).contains('Approve')
  })

  function approveVeNFT(pageName: string) {
    cy.get(`[data-testid=venft-${pageName}-loading]`).should('not.exist')
    cy.get(`[data-testid=venft-${pageName}-row-2-action]`).contains('Approve').click()
    cy.get(`[data-testid=venft-${pageName}-loading]`).should('exist')
    cy.get('[data-testid=explorer-link-success-box]')
  }

  it('approves from sell page', () => {
    ethBridge.setHandler(veNFT[SupportedChainId.FANTOM], approvedAllVeNFTHandler)
    cy.spy(approvedAllVeNFTHandler.handler, 'approveSpy')
    cy.visit('/venft/sell/')
    approveVeNFT('sell')
    cy.window().then((win) => {
      expect(approvedAllVeNFTHandler.handler.approveSpy).to.have.calledWith(
        Vault[SupportedChainId.FANTOM],
        tokenListSorted[2].tokenId
      )
    })
  })

  it('approves from deposit page', () => {
    ethBridge.setHandler(veNFT[SupportedChainId.FANTOM], approvedAllVeNFTHandler)
    cy.spy(approvedAllVeNFTHandler.handler, 'approveSpy')
    cy.visit('/venft/deposit/')
    approveVeNFT('deposit')
    cy.window().then((win) => {
      expect(approvedAllVeNFTHandler.handler.approveSpy).to.have.calledWith(
        Vault[SupportedChainId.FANTOM],
        tokenListSorted[2].tokenId
      )
    })
  })
})
