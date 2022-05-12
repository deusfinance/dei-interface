import { HasVeNFTToSellApprovedAllBridge, HasVeNFTToSellBridge, provider, signer } from '../support/commands'
import { tokenListSorted } from '../utils/data'
import { Multicall2, Vault, veNFT } from '../../src/constants/addresses'
import { SupportedChainId } from '../../src/constants/chains'
import VENFT_ABI from '../../src/constants/abi/veNFT.json'
import MULTICALL2_ABI from '../../src/constants/abi/MULTICALL2.json'
import { ApprovedAllVeNFTHandler, BaseVeNFTHandler, ZeroBalanceVeNFTHandler } from '../utils/abihandlers/veNFT'
import { BaseMulticallHandler } from '../utils/abihandlers/Multicall'
import VAULT_ABI from '../../src/constants/abi/Vault.json'
import { BaseVaultHandler } from '../utils/abihandlers/Vault'

describe('Approve VeNFT', () => {
  const veNFTHandler = {
    abi: VENFT_ABI,
    handler: new BaseVeNFTHandler(),
  }
  const approvedAllVeNFTHandler = {
    abi: VENFT_ABI,
    handler: new ApprovedAllVeNFTHandler(),
  }
  const multicallHandler = {
    abi: MULTICALL2_ABI,
    handler: new BaseMulticallHandler(),
  }
  const vaultHandler = {
    abi: VAULT_ABI,
    handler: new BaseVaultHandler(),
  }

  it('gets VeNFT balance', () => {
    const zeroBalanceVeNFTHandler = {
      abi: VENFT_ABI,
      handler: new ZeroBalanceVeNFTHandler(),
    }

    const ethBridge = new HasVeNFTToSellBridge(signer, provider)
    ethBridge.setHandler(veNFT[SupportedChainId.FANTOM], zeroBalanceVeNFTHandler)
    ethBridge.setHandler(Multicall2[SupportedChainId.FANTOM], multicallHandler)
    ethBridge.setHandler(Vault[SupportedChainId.FANTOM], vaultHandler)
    cy.on('window:before:load', (win) => {
      // @ts-ignore
      win.ethereum = ethBridge
      cy.spy(zeroBalanceVeNFTHandler.handler, 'balanceOf')
    })

    cy.visit('/venft/sell/')

    cy.wait(1500)
    cy.window().then((win) => {
      expect(zeroBalanceVeNFTHandler.handler.balanceOf).to.have.callCount(1)
    })
    cy.get(`[data-testid=venft-sell-no-results]`)
  })
  it('loads VeNFT list', () => {
    const ethBridge = new HasVeNFTToSellBridge(signer, provider)
    ethBridge.setHandler(veNFT[SupportedChainId.FANTOM], veNFTHandler)
    ethBridge.setHandler(Multicall2[SupportedChainId.FANTOM], multicallHandler)
    ethBridge.setHandler(Vault[SupportedChainId.FANTOM], vaultHandler)
    cy.on('window:before:load', (win) => {
      // @ts-ignore
      win.ethereum = ethBridge
      cy.spy(veNFTHandler.handler, 'balanceOf')
      cy.spy(veNFTHandler.handler, 'tokenOfOwnerByIndex')
      cy.spy(veNFTHandler.handler, 'locked')
    })

    cy.visit('/venft/sell/')
    const expectTokenId = tokenListSorted[1].tokenId
    cy.get(`[data-testid=venft-sell-row-1-token-id]`).contains(expectTokenId)
    cy.window().then((win) => {
      expect(veNFTHandler.handler.balanceOf).to.have.callCount(1)
      expect(veNFTHandler.handler.tokenOfOwnerByIndex).to.have.callCount(tokenListSorted.length)
      expect(veNFTHandler.handler.locked).to.have.callCount(tokenListSorted.length)
    })
  })

  it('checks approval for single tokens', () => {
    const ethBridge = new HasVeNFTToSellBridge(signer, provider)
    ethBridge.setHandler(veNFT[SupportedChainId.FANTOM], veNFTHandler)
    ethBridge.setHandler(Multicall2[SupportedChainId.FANTOM], multicallHandler)
    ethBridge.setHandler(Vault[SupportedChainId.FANTOM], vaultHandler)
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
    const ethBridge = new HasVeNFTToSellBridge(signer, provider)
    ethBridge.setHandler(veNFT[SupportedChainId.FANTOM], approvedAllVeNFTHandler)
    ethBridge.setHandler(Multicall2[SupportedChainId.FANTOM], multicallHandler)
    ethBridge.setHandler(Vault[SupportedChainId.FANTOM], vaultHandler)
    cy.on('window:before:load', (win) => {
      // @ts-ignore
      win.ethereum = ethBridge
    })
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
    const ethBridge = new HasVeNFTToSellApprovedAllBridge(signer, provider)
    ethBridge.setHandler(veNFT[SupportedChainId.FANTOM], approvedAllVeNFTHandler)
    ethBridge.setHandler(Multicall2[SupportedChainId.FANTOM], multicallHandler)
    ethBridge.setHandler(Vault[SupportedChainId.FANTOM], vaultHandler)
    cy.on('window:before:load', (win) => {
      // @ts-ignore
      win.ethereum = ethBridge
      cy.spy(approvedAllVeNFTHandler.handler, 'approveSpy')
    })
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
    const ethBridge = new HasVeNFTToSellApprovedAllBridge(signer, provider)
    ethBridge.setHandler(veNFT[SupportedChainId.FANTOM], approvedAllVeNFTHandler)
    ethBridge.setHandler(Multicall2[SupportedChainId.FANTOM], multicallHandler)
    ethBridge.setHandler(Vault[SupportedChainId.FANTOM], vaultHandler)
    cy.on('window:before:load', (win) => {
      // @ts-ignore
      win.ethereum = ethBridge
      cy.spy(approvedAllVeNFTHandler.handler, 'approveSpy')
    })
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
