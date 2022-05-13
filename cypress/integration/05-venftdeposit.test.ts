import { getCustomizedBridge } from '../utils/ethbridge/customizedbridge'
import { tokenListSorted } from '../utils/data'
import { Multicall2, Vault, veNFT } from '../../src/constants/addresses'
import { SupportedChainId } from '../../src/constants/chains'
import { getMulticallHandler } from '../utils/ethbridge/abihandlers/Multicall'
import { BaseVeNFTHandler, getApprovedAllVeNFTHandler } from '../utils/ethbridge/abihandlers/veNFT'
import { BaseVaultHandler, getVaultHandler } from '../utils/ethbridge/abihandlers/Vault'

describe('render VeNFT Deposit Page', () => {
  it('renders page when wallet is not connected', () => {
    cy.visit('/venft/deposit/')
    cy.get('[data-testid=venft-deposit-page]')
  })
})

describe('VeNFT Deposit', () => {
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
  const veNFTTokensAfterDeposit = [...tokenListSorted].splice(1)

  function depositVeNFT(vaultHandlerClass: BaseVaultHandler, veNFTHandlerClass: BaseVeNFTHandler) {
    cy.wait(500)
    cy.get(`[data-testid=venft-deposit-row-${tokenIndex}-token-id]`).contains(expectTokenId)
    cy.get(`[data-testid=venft-deposit-row-${tokenIndex}-action]`)
      .contains('Deposit')
      .then(() => {
        vaultHandlerClass.setLockPendingTokenId(expectTokenId)
        vaultHandlerClass.setBridgeTokens(veNFTTokensAfterDeposit)
        veNFTHandlerClass.setBridgeTokens(veNFTTokensAfterDeposit)
      })
    cy.get('[data-testid=venft-deposit-loading]').should('not.exist')
    cy.get(`[data-testid=venft-deposit-row-${tokenIndex}-action]`).click()
    cy.get('[data-testid=venft-deposit-loading]').should('exist')
    cy.get('[data-testid=explorer-link-success-box]')
    cy.get('[data-testid=explorer-link-success-box-close]').click()
  }

  function showLockModal(vaultHandlerClass: BaseVaultHandler) {
    cy.get(`[data-testid=venft-deposit-lock]`).should('exist')
    cy.get(`[data-testid=venft-deposit-lock-token-id]`)
      .contains(expectTokenId)
      .then(() => {
        vaultHandlerClass.setLockPendingTokenId(0)
      })
    cy.get(`[data-testid=venft-deposit-lock-action]`).click()
    cy.url().should('include', expectTokenId)
  }

  it('deposits veNFT', () => {
    const vaultHandler = getVaultHandler()
    const veNFTHandler = getApprovedAllVeNFTHandler()
    ethBridge.setHandler(Vault[SupportedChainId.FANTOM], vaultHandler)
    ethBridge.setHandler(veNFT[SupportedChainId.FANTOM], veNFTHandler)

    cy.spy(vaultHandler.handler, 'depositVeNFTSpy')

    cy.visit('/venft/deposit/')
    depositVeNFT(vaultHandler.handler, veNFTHandler.handler)
    cy.window().then((win) => {
      const expectTokenId = tokenListSorted[tokenIndex].tokenId
      expect(vaultHandler.handler.depositVeNFTSpy).to.have.calledWith(expectTokenId)
    })
  })

  it('shows vote and lock venft modal', () => {
    const vaultHandler = getVaultHandler()
    vaultHandler.handler.setLockPendingTokenId(expectTokenId)
    const veNFTHandler = getApprovedAllVeNFTHandler()
    ethBridge.setHandler(Vault[SupportedChainId.FANTOM], vaultHandler)
    ethBridge.setHandler(veNFT[SupportedChainId.FANTOM], veNFTHandler)
    cy.visit('/venft/deposit/')
    showLockModal(vaultHandler.handler)
  })

  it('deposits and goes for vote page', () => {
    const vaultHandler = getVaultHandler()
    const veNFTHandler = getApprovedAllVeNFTHandler()
    ethBridge.setHandler(Vault[SupportedChainId.FANTOM], vaultHandler)
    ethBridge.setHandler(veNFT[SupportedChainId.FANTOM], veNFTHandler)
    cy.visit('/venft/deposit/')
    depositVeNFT(vaultHandler.handler, veNFTHandler.handler)
    showLockModal(vaultHandler.handler)
  })
})
