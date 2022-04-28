// ***********************************************
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

import { Eip1193Bridge } from '@ethersproject/experimental/lib/eip1193-bridge';
import { JsonRpcProvider } from '@ethersproject/providers';
import { Wallet } from '@ethersproject/wallet';
import { shortenAddress } from '../../src/utils';

// todo: figure out how env vars actually work in CI
// const TEST_PRIVATE_KEY = Cypress.env('INTEGRATION_TEST_PRIVATE_KEY')
const TEST_PRIVATE_KEY = '0xe580410d7c37d26c6ad1a837bbae46bc27f9066a466fb3a66e770523b4666d19';

// address of the above key
export const TEST_ADDRESS_NEVER_USE = new Wallet(TEST_PRIVATE_KEY).address;

export const TEST_ADDRESS_NEVER_USE_SHORTENED = shortenAddress(TEST_ADDRESS_NEVER_USE);

export class CustomizedBridge extends Eip1193Bridge {
  chainId = 4;

  async sendAsync(...args) {
    console.debug('sendAsync called', ...args);
    return this.send(...args);
  }

  getSendArgs(args) {
    console.debug('send called', ...args);
    const isCallbackForm = typeof args[0] === 'object' && typeof args[1] === 'function';
    let callback;
    let method;
    let params;
    if (isCallbackForm) {
      callback = args[1];
      method = args[0].method;
      params = args[0].params;
    } else {
      method = args[0];
      params = args[1];
    }
    return {
      isCallbackForm,
      callback,
      method,
      params,
    };
  }

  async send(...args) {
    const { isCallbackForm, callback, method, params } = this.getSendArgs(args);
    if (method === 'eth_requestAccounts' || method === 'eth_accounts') {
      if (isCallbackForm) {
        callback({ result: [TEST_ADDRESS_NEVER_USE] });
      } else {
        return Promise.resolve([TEST_ADDRESS_NEVER_USE]);
      }
    }
    if (method === 'eth_chainId') {
      if (isCallbackForm) {
        callback(null, { result: '0x4' });
      } else {
        return Promise.resolve('0x4');
      }
    }
    try {
      const result = await super.send(method, params);
      console.debug('result received', method, params, result);
      if (isCallbackForm) {
        callback(null, { result });
      } else {
        return result;
      }
    } catch (error) {
      if (isCallbackForm) {
        callback(error, null);
      } else {
        throw error;
      }
    }
  }
}

export class SwitchChainBridge extends CustomizedBridge {
  switchEthereumChainSpy(chainId) {}

  async send(...args) {
    const { isCallbackForm, callback, method, params } = this.getSendArgs(args);
    if (method === 'wallet_switchEthereumChain') {
      this.switchEthereumChainSpy(params[0].chainId);
      if (isCallbackForm) {
        callback(null, { result: null });
      } else {
        return null;
      }
    }
    return super.send(...args);
  }
}

export class SwitchToUnrecognizedChainBridge extends CustomizedBridge {
  switchEthereumChainSpy(chainId) {}

  addEthereumChainSpy(chainId) {}

  async send(...args) {
    const { isCallbackForm, callback, method, params } = this.getSendArgs(args);
    if (method === 'wallet_switchEthereumChain') {
      this.switchEthereumChainSpy(params[0].chainId);
      const chainId = params[0].chainId;
      const error = {
        code: 4902, // To-be-standardized "unrecognized chain ID" error
        message: `Unrecognized chain ID "${chainId}". Try adding the chain using wallet_addEthereumChain first.`,
      };
      if (isCallbackForm) {
        callback(error, null);
      } else {
        throw error;
      }
    }
    if (method === 'wallet_addEthereumChain') {
      this.addEthereumChainSpy(params[0].chainId);
      if (isCallbackForm) {
        callback(null, { result: null });
      } else {
        return null;
      }
    }
    return super.send(...args);
  }
}

export const provider = new JsonRpcProvider('https://rinkeby.infura.io/v3/4bf032f2d38a4ed6bb975b80d6340847', 4);
export const signer = new Wallet(TEST_PRIVATE_KEY, provider);
