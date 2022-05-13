import { getCustomizedBridge } from '../utils/ethbridge/customizedbridge'
import { tokenListSorted } from '../utils/data'
import { Multicall2, Vault, veNFT } from '../../src/constants/addresses'
import { SupportedChainId } from '../../src/constants/chains'
import { getMulticallHandler } from '../utils/ethbridge/abihandlers/Multicall'
import { BaseVaultHandler, getVaultHandler } from '../utils/ethbridge/abihandlers/Vault'
import { BaseVeNFTHandler, getApprovedAllVeNFTHandler } from '../utils/ethbridge/abihandlers/veNFT'

describe('render VeNFT Sell Page', () => {
  it('renders page when wallet is not connected', () => {
    cy.visit('/venft/sell/')
    cy.get('[data-testid=venft-sell-page]')
  })
})

describe('VeNFT Sell', () => {
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
  const veNFTTokensAfterSell = [...tokenListSorted].splice(1)

  function sellVeNFT(vaultHandlerClass: BaseVaultHandler, veNFTHandlerClass: BaseVeNFTHandler) {
    cy.wait(500)
    cy.get(`[data-testid=venft-fsolid-withdraw]`).should('not.exist')
    cy.get(`[data-testid=venft-sell-row-${tokenIndex}-token-id]`).contains(expectTokenId)
    cy.get(`[data-testid=venft-sell-row-${tokenIndex}-action]`)
      .contains('Sell')
      .then(() => {
        vaultHandlerClass.setWithdrawFsolidTokenId(expectTokenId)
        vaultHandlerClass.setBridgeTokens(veNFTTokensAfterSell)
        veNFTHandlerClass.setBridgeTokens(veNFTTokensAfterSell)
      })
    cy.get('[data-testid=venft-sell-loading]').should('not.exist')
    cy.get(`[data-testid=venft-sell-row-${tokenIndex}-action]`).click()
    cy.get('[data-testid=venft-sell-loading]').should('exist')
    cy.get('[data-testid=explorer-link-success-box]')
    cy.get('[data-testid=explorer-link-success-box-close]').click()
  }

  function withdrawFSolid(vaultHandlerClass: BaseVaultHandler) {
    cy.get(`[data-testid=venft-fsolid-withdraw]`).should('exist')
    cy.get(`[data-testid=venft-fsolid-withdraw-token-id]`)
      .contains(expectTokenId)
      .then(() => {
        vaultHandlerClass.setWithdrawFsolidTokenId(0)
      })
    cy.get('[data-testid=venft-fsolid-withdraw-loading]').should('not.exist')
    cy.get(`[data-testid=venft-fsolid-withdraw-action]`).click()
    cy.get('[data-testid=venft-fsolid-withdraw-loading]').should('exist')
    cy.get('[data-testid=explorer-link-success-box]')
    cy.get('[data-testid=explorer-link-success-box-close]').click()
    cy.get(`[data-testid=venft-fsolid-withdraw]`).should('not.exist')
  }

  it('sells veNFT', () => {
    const vaultHandler = getVaultHandler()
    const veNFTHandler = getApprovedAllVeNFTHandler()
    ethBridge.setHandler(Vault[SupportedChainId.FANTOM], vaultHandler)
    ethBridge.setHandler(veNFT[SupportedChainId.FANTOM], veNFTHandler)
    cy.spy(vaultHandler.handler, 'sellVeNFTSpy')

    cy.visit('/venft/sell/')
    sellVeNFT(vaultHandler.handler, veNFTHandler.handler)
    cy.window().then((win) => {
      expect(vaultHandler.handler.sellVeNFTSpy).to.have.calledWith(expectTokenId)
    })
  })

  it('withdraws fsolid after selling veNFT', () => {
    const vaultHandler = getVaultHandler()
    vaultHandler.handler.setWithdrawFsolidTokenId(expectTokenId)
    const veNFTHandler = getApprovedAllVeNFTHandler()
    ethBridge.setHandler(Vault[SupportedChainId.FANTOM], vaultHandler)
    ethBridge.setHandler(veNFT[SupportedChainId.FANTOM], veNFTHandler)
    cy.spy(vaultHandler.handler, 'withdraw')
    cy.visit('/venft/sell/')
    withdrawFSolid(vaultHandler.handler)
    cy.window().then((win) => {
      expect(vaultHandler.handler.withdraw).to.have.callCount(1)
    })
  })

  it('sells veNFT and withdraws fsolid', () => {
    const vaultHandler = getVaultHandler()
    const veNFTHandler = getApprovedAllVeNFTHandler()
    ethBridge.setHandler(Vault[SupportedChainId.FANTOM], vaultHandler)
    ethBridge.setHandler(veNFT[SupportedChainId.FANTOM], veNFTHandler)
    cy.spy(vaultHandler.handler, 'withdraw')
    cy.spy(vaultHandler.handler, 'sellVeNFTSpy')
    cy.visit('/venft/sell/')
    sellVeNFT(vaultHandler.handler, veNFTHandler.handler)
    withdrawFSolid(vaultHandler.handler)
    cy.window().then((win) => {
      expect(vaultHandler.handler.withdraw).to.have.callCount(1)
    })
    // one token is sold and removed, so
    cy.get(`[data-testid=venft-sell-row-${tokenListSorted.length - 1}-token-id]`).should('not.exist')
  })
})
