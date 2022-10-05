import { Token } from '@sushiswap/core-sdk'
import { BDEI_TOKEN, DEI_TOKEN, VDEUS_TOKEN } from 'constants/tokens'

export type MigrationStateType = {
  inputToken: Token
  outputToken: Token
  leverage: number
  oracleUpdate: boolean
  snapshotConfirmation: boolean
}

export const MigrationStates: MigrationStateType[] = [
  // TODO: scusdc,  scdai => bdei

  // Legacy dei => vdeus
  {
    inputToken: DEI_TOKEN,
    outputToken: VDEUS_TOKEN,
    leverage: 1,
    oracleUpdate: false,
    snapshotConfirmation: false,
  },
  // Bdei => vdeus
  {
    inputToken: BDEI_TOKEN,
    outputToken: VDEUS_TOKEN,
    leverage: 1,
    oracleUpdate: false,
    snapshotConfirmation: false,
  },
  // Legacy dei or vdeus => bdei(with snapshot)
  {
    inputToken: DEI_TOKEN,
    outputToken: BDEI_TOKEN,
    leverage: 1,
    oracleUpdate: true,
    snapshotConfirmation: true,
  },
  {
    inputToken: VDEUS_TOKEN,
    outputToken: BDEI_TOKEN,
    leverage: 2,
    oracleUpdate: true,
    snapshotConfirmation: true,
  },
]
