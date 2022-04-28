// import {
//   CustomizedBridge,
//   provider,
//   signer,
//   SwitchChainBridge,
//   SwitchToUnrecognizedChainBridge,
//   TEST_ADDRESS_NEVER_USE,
//   TEST_ADDRESS_NEVER_USE_SHORTENED,
// } from '../support/commands'
// import { chainList, chainListAuthenticatedClaimedFirst } from '../utils/data'
// import { formatChainId } from '../../src/utils'
//
// describe('Landing Page', () => {
//   // @ts-ignore
//   const setupEthBridge = () => {
//     cy.on('window:before:load', (win) => {
//       // @ts-ignore
//       win.ethereum = new CustomizedBridge(signer, provider)
//     })
//   }
//
//   const setupGetChainListServerGeneral = () => {
//     cy.route({
//       method: 'GET',
//       url: `/api/v1/chain/list/`,
//       response: chainList,
//     })
//   }
//   const setupGetChainListServerNotAuthenticated = () => {
//     setupGetChainListServerGeneral()
//     cy.route({
//       method: 'GET',
//       url: `/api/v1/chain/list/${TEST_ADDRESS_NEVER_USE}`,
//       response: chainList,
//     })
//   }
//
//   const setupGetChainListAuthenticatedServer = () => {
//     setupGetChainListServerGeneral()
//     cy.route({
//       method: 'GET',
//       url: `/api/v1/chain/list/${TEST_ADDRESS_NEVER_USE}`,
//       response: chainListAuthenticatedClaimedFirst,
//     })
//   }
//
//   it('is connected', () => {
//     setupEthBridge()
//     cy.visit('/')
//     cy.get('[data-cy=wallet-connect]').click()
//     cy.get('[data-cy=wallet-connect]').contains(TEST_ADDRESS_NEVER_USE_SHORTENED)
//   })
//
//   it('loads chain list', () => {
//     cy.server()
//     setupGetChainListServerNotAuthenticated()
//     cy.visit('/')
//     cy.get(`[data-cy=chain-name-${chainList[0].pk}]`).contains(chainList[0].chainName)
//     cy.get(`[data-cy=chain-claim-${chainList[1].pk}]`).contains('Claim ')
//   })
//
//   it('loads chain list authenticated', () => {
//     setupEthBridge()
//     cy.server()
//     setupGetChainListAuthenticatedServer()
//     cy.visit('/')
//     cy.get(`[data-cy=chain-claim-${chainList[0].pk}]`).contains('Claimed')
//     cy.get(`[data-cy=chain-claim-${chainList[1].pk}]`).contains('Claim ')
//   })
//
//   it('switches to network', () => {
//     const ethBridge = new SwitchChainBridge(signer, provider)
//     cy.on('window:before:load', (win) => {
//       // @ts-ignore
//       win.ethereum = ethBridge
//       // @ts-ignore
//       cy.spy(win.ethereum, 'switchEthereumChainSpy')
//     })
//
//     cy.server()
//     setupGetChainListAuthenticatedServer()
//     cy.visit('/')
//     cy.get(`[data-cy=chain-switch-${chainList[0].pk}]`).click()
//     const expectedChainId = formatChainId(chainList[0].chainId)
//
//     cy.window().then((win) => {
//       // @ts-ignore
//       expect(win.ethereum.switchEthereumChainSpy).to.have.calledWith(expectedChainId)
//     })
//   })
//
//   it('adds network', () => {
//     const ethBridge = new SwitchToUnrecognizedChainBridge(signer, provider)
//     cy.on('window:before:load', (win) => {
//       // @ts-ignore
//       win.ethereum = ethBridge
//       // @ts-ignore
//       cy.spy(win.ethereum, 'switchEthereumChainSpy')
//       // @ts-ignore
//       cy.spy(win.ethereum, 'addEthereumChainSpy')
//     })
//
//     cy.server()
//     setupGetChainListAuthenticatedServer()
//     cy.visit('/')
//     cy.get(`[data-cy=chain-switch-${chainList[0].pk}]`).click()
//     const expectedChainId = formatChainId(chainList[0].chainId)
//
//     cy.window().then((win) => {
//       // @ts-ignore
//       expect(win.ethereum.switchEthereumChainSpy).to.have.calledWith(expectedChainId)
//       // @ts-ignore
//       expect(win.ethereum.addEthereumChainSpy).to.have.calledWith(expectedChainId)
//     })
//   })
// })
