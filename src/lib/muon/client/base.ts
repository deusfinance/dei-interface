import axios, { AxiosInstance } from 'axios'
import { getAddress } from '@ethersproject/address'

import { MuonResponse } from '../types'
import { Type } from '../error'

interface IConstructor {
  baseURL: string
  nSign: number
  APP_ID: string
  APP_METHOD: string
}

export class MuonClient {
  private _api: AxiosInstance
  public APP_ID: string
  public APP_METHOD: string
  public nSign: number

  constructor({ baseURL, nSign, APP_ID, APP_METHOD }: IConstructor) {
    this._api = axios.create({
      baseURL,
      timeout: 20000,
    })
    this.nSign = nSign
    this.APP_ID = APP_ID
    this.APP_METHOD = APP_METHOD
  }

  public _getChecksumAddress(contract: string) {
    try {
      return getAddress(contract)
    } catch (err) {
      return false
    }
  }

  // TODO: update the `token` from the requestParams (hardcode for now for testing purposes)
  public async _makeRequest(requestParams: any): Promise<Type<MuonResponse>> {
    const response = await this._api({
      method: 'GET',
      url: `?app=${this.APP_ID}&method=${this.APP_METHOD}&nSign=10&&params[token]=0x5821573d8F04947952e76d94f3ABC6d7b43bF8d0`,
      // TODO: FOR SOME REASON THIS DATA (THE REQUEST BODY) IS INVALID ACCORDING TO MUON, FIGURE OUT WHY
      // data: {
      //   app: this.APP_ID,
      //   method: this.APP_METHOD,
      //   nSign: this.nSign,
      //   params: requestParams
      // },
    })

    if (response.status !== 200) {
      return new Error('Unable to reach the Muon Network.')
    }
    return response.data
  }
}
