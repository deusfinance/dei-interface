import { constructSameAddressMap } from 'utils/address'
import { SupportedChainId } from './chains'

interface AddressMap {
  [chainId: number]: string
}

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

export const Multicall2: AddressMap = {
  [SupportedChainId.FANTOM]: '0x22D4cF72C45F8198CfbF4B568dBdB5A85e8DC0B5',
}

/* =====================================
                USDC ADDRESS
===================================== */
export const USDC_ADDRESS = {
  [SupportedChainId.MAINNET]: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  [SupportedChainId.RINKEBY]: '0x49AC7cEDdb9464DA9274b164Cd6BA7129Da2C03E',
  [SupportedChainId.POLYGON]: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
  [SupportedChainId.FANTOM]: '0x04068DA6C83AFCFA0e13ba15A6696662335D5B75',
  [SupportedChainId.BSC]: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
}

/* =====================================
                DEI ADDRESS
===================================== */
export const DEI_ADDRESS: AddressMap = {
  ...constructSameAddressMap('0xDE12c7959E1a72bbe8a5f7A1dc8f8EeF9Ab011B3', [
    SupportedChainId.MAINNET,
    SupportedChainId.POLYGON,
    SupportedChainId.FANTOM,
  ]),
}

/* =====================================
                DEUS ADDRESS
===================================== */
export const DEUS_ADDRESS: AddressMap = {
  ...constructSameAddressMap('0xDE5ed76E7c05eC5e4572CfC88d1ACEA165109E44', [
    SupportedChainId.MAINNET,
    SupportedChainId.POLYGON,
    SupportedChainId.FANTOM,
  ]),
}

export const DynamicRedeemer: AddressMap = {
  [SupportedChainId.FANTOM]: '0xFD74E924dc96c72Ba52439e28CE780908A630D13',
}

export const veDEUS: AddressMap = {
  [SupportedChainId.FANTOM]: '0x8b42c6cb07c8dd5fe5db3ac03693867afd11353d',
}

export const veDist: AddressMap = {
  [SupportedChainId.FANTOM]: '0x7fA100558af1381C0D803477F4091C7F740c1da0',
}

export const BaseV1Factory: AddressMap = {
  [SupportedChainId.FANTOM]: '0x3faab499b519fdc5819e3d7ed0c26111904cbc28',
}

export const BaseV1Voter: AddressMap = {
  [SupportedChainId.FANTOM]: '0xdC819F5d05a6859D2faCbB4A44E5aB105762dbaE',
}

export const BaseV1Minter: AddressMap = {
  [SupportedChainId.FANTOM]: '0xC4209c19b183e72A037b2D1Fb11fbe522054A90D',
}

// NEEDS CHANGING
export const LenderManager: AddressMap = {
  [SupportedChainId.FANTOM]: '0xc02f204bab0248c694516dbaf985d40718ed4f86',
}

// NEEDS CHANGING
export const SolidAddress: AddressMap = {
  [SupportedChainId.FANTOM]: '0xDE12c7959E1a72bbe8a5f7A1dc8f8EeF9Ab011B3',
}

// NEEDS CHANGING
export const Locker: AddressMap = {
  [SupportedChainId.FANTOM]: '0xDE12c7959E1a72bbe8a5f7A1dc8f8EeF9Ab011B3',
}

// NEEDS CHANGING
export const SolidexLpDepositor: AddressMap = {
  [SupportedChainId.FANTOM]: '0x26E1A0d851CF28E697870e1b7F053B605C8b060F',
}

export const Reimburse: AddressMap = {
  [SupportedChainId.FANTOM]: '0x85B6996ab768600C14dA1464205bd6b3a864417D',
}
