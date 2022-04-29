import {
  CustomizedBridge,
  provider,
  signer,
  TEST_ADDRESS_NEVER_USE,
  TEST_ADDRESS_NEVER_USE_SHORTENED,
} from '../support/commands'

describe('Landing Page', () => {
  // @ts-ignore
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

  // it('loads chain list', () => {
  //   cy.server()
  //   setupGetChainListServerNotAuthenticated()
  //   cy.visit('/')
  //   cy.get(`[data-cy=chain-name-${chainList[0].pk}]`).contains(chainList[0].chainName)
  //   cy.get(`[data-cy=chain-claim-${chainList[1].pk}]`).contains('Claim ')
  // })
  //
  // it('loads chain list authenticated', () => {
  //   setupEthBridge()
  //   cy.server()
  //   setupGetChainListAuthenticatedServer()
  //   cy.visit('/')
  //   cy.get(`[data-cy=chain-claim-${chainList[0].pk}]`).contains('Claimed')
  //   cy.get(`[data-cy=chain-claim-${chainList[1].pk}]`).contains('Claim ')
  // })
  //
  it('loads VeNFT list', () => {
    const ethBridge = new CustomizedBridge(signer, provider)
    cy.on('window:before:load', (win) => {
      // @ts-ignore
      win.ethereum = ethBridge
      // @ts-ignore
      cy.spy(ethBridge, 'VeNFTBalanceOfSpy')
    })

    cy.visit('/venft/sell/')
    // cy.get(`[data-cy=chain-switch-${chainList[0].pk}]`).click()
    // const expectedChainId = formatChainId(chainList[0].chainId)

    cy.wait(1000)
    cy.window().then((win) => {
      // @ts-ignore
      expect(ethBridge.VeNFTBalanceOfSpy).to.have.calledWith(TEST_ADDRESS_NEVER_USE)
    })
  })
  //
  // it('adds network', () => {
  //   const ethBridge = new SwitchToUnrecognizedChainBridge(signer, provider)
  //   cy.on('window:before:load', (win) => {
  //     // @ts-ignore
  //     win.ethereum = ethBridge
  //     // @ts-ignore
  //     cy.spy(win.ethereum, 'switchEthereumChainSpy')
  //     // @ts-ignore
  //     cy.spy(win.ethereum, 'addEthereumChainSpy')
  //   })
  //
  //   cy.server()
  //   setupGetChainListAuthenticatedServer()
  //   cy.visit('/')
  //   cy.get(`[data-cy=chain-switch-${chainList[0].pk}]`).click()
  //   const expectedChainId = formatChainId(chainList[0].chainId)
  //
  //   cy.window().then((win) => {
  //     // @ts-ignore
  //     expect(win.ethereum.switchEthereumChainSpy).to.have.calledWith(expectedChainId)
  //     // @ts-ignore
  //     expect(win.ethereum.addEthereumChainSpy).to.have.calledWith(expectedChainId)
  //   })
  // })
})
