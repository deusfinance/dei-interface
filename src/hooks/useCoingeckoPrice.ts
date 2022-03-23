import { useEffect, useState } from 'react'
import CoinGecko from 'coingecko-api'

import { CoingeckoQueue } from 'utils/queue'
const CoinGeckoClient = new CoinGecko()

export enum SymbolIdentifiers {
  DEUS = 'deus-finance-2',
}

export function useDeusPrice() {
  return useCoingeckoPrice(SymbolIdentifiers.DEUS)
}

const DEFAULT_PRICE = '400'

export default function useCoingeckoPrice(symbol: string): string {
  const [price, setPrice] = useState(DEFAULT_PRICE)

  useEffect(() => {
    const fetchPrice = () => {
      CoingeckoQueue.add(async () => {
        try {
          const result = await CoinGeckoClient.simple.price({
            ids: [symbol],
            vs_currencies: ['usd'],
          })
          const price: number = result?.data?.[symbol]?.usd ?? 0
          setPrice(price.toString())
        } catch (err) {
          console.log('Unable to fetch coingecko price:')
          console.error(err)
          setPrice(DEFAULT_PRICE)
        }
      })
    }
    fetchPrice()
  }, [symbol])

  return price
}
