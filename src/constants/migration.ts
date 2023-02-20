import { Token } from '@sushiswap/core-sdk'
import { BDEI_TOKEN, DEI_TOKEN, scDAI_TOKEN, scUSDC_TOKEN, VDEUS_TOKEN } from 'constants/tokens'

export type MigrationStateType = {
  inputToken: Token
  outputToken: Token
  leverage: number
  oracleUpdate: boolean
  snapshotConfirmation: boolean
  proof: boolean
  methodName: string
  limitToken?: string
  limitMethodName?: string
}

export const MigrationStates: MigrationStateType[] = [
  {
    inputToken: scUSDC_TOKEN,
    outputToken: BDEI_TOKEN,
    leverage: 1,
    oracleUpdate: false,
    snapshotConfirmation: false,
    proof: false,
    methodName: 'tokenToBDEI', // 13: tokenAddress, amount,
    limitToken: 'bDEI',
    limitMethodName: 'token_bDEI',
  },
  {
    inputToken: scDAI_TOKEN,
    outputToken: BDEI_TOKEN,
    leverage: 1,
    oracleUpdate: false,
    snapshotConfirmation: false,
    proof: false,
    methodName: 'tokenToBDEI', // 13: tokenAddress, amount,
    limitToken: 'bDEI',
    limitMethodName: 'token_bDEI',
  },
  // {
  //   inputToken: DEI_TOKEN,
  //   outputToken: VDEUS_TOKEN,
  //   leverage: 1,
  //   oracleUpdate: true,
  //   snapshotConfirmation: false,
  //   proof: false,
  //   methodName: 'migrateLegacyDEIToVDEUS', // 5: amount
  //   limitToken: 'legacyDEI',
  //   limitMethodName: 'legacyDEI_vDEUS',
  // },
  // {
  //   inputToken: BDEI_TOKEN,
  //   outputToken: VDEUS_TOKEN,
  //   leverage: 2,
  //   oracleUpdate: true,
  //   snapshotConfirmation: false,
  //   proof: false,
  //   limitToken: 'bDEI',
  //   methodName: 'migrateBDEIToVDEUS', // 4: amount
  //   limitMethodName: 'bDEI_vDEUS',
  // },
  {
    inputToken: DEI_TOKEN,
    outputToken: BDEI_TOKEN,
    leverage: 1,
    oracleUpdate: true,
    snapshotConfirmation: true,
    proof: true,
    methodName: 'legacyDEIToBDEI', // 3: amount, claimableBDEI, proof
  },
  {
    inputToken: VDEUS_TOKEN,
    outputToken: BDEI_TOKEN,
    leverage: 1,
    oracleUpdate: true,
    snapshotConfirmation: true,
    proof: true,
    methodName: 'vDEUSToBDEI', // 15: amount, claimableBDEI, proof
  },
]
