import { SupportedChainId } from './chains'

interface AddressMap {
  [chainId: number]: string
}

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

export const Multicall2: AddressMap = {
  [SupportedChainId.FANTOM]: '0x22D4cF72C45F8198CfbF4B568dBdB5A85e8DC0B5',
}

export const veDEUS: AddressMap = {
  [SupportedChainId.FANTOM]: '0x8b42c6cb07c8dd5fe5db3ac03693867afd11353d',
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

export const HolderManager: AddressMap = {
  [SupportedChainId.FANTOM]: '0xd7Ea68F1FcF197897906990C0CadA53cf016af99',
}

export const GeneralLenderOracle: AddressMap = {
  [SupportedChainId.FANTOM]: '0x034e7a61BcB90D95c67f6C386877F4297c463Aa1',
}

export const SolidAddress: AddressMap = {
  [SupportedChainId.FANTOM]: '0xDE12c7959E1a72bbe8a5f7A1dc8f8EeF9Ab011B3',
}

// NEEDS CHANGING
export const Locker: AddressMap = {
  [SupportedChainId.FANTOM]: '0xDE12c7959E1a72bbe8a5f7A1dc8f8EeF9Ab011B3',
}

export const SolidexLpDepositor: AddressMap = {
  [SupportedChainId.FANTOM]: '0x26E1A0d851CF28E697870e1b7F053B605C8b060F',
}

export const Reimburse: AddressMap = {
  [SupportedChainId.FANTOM]: '0x85B6996ab768600C14dA1464205bd6b3a864417D',
}

export const OxDaoHolderFactory: AddressMap = {
  [SupportedChainId.FANTOM]: '0xD427b027c3FE976128364f08e5C51364bAAe1b69',
}
