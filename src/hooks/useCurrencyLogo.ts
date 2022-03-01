import { useMemo } from 'react'

// TODO make this more intelligent using Uniswap's TokenList
export default function useCurrencyLogo(id: string | undefined, symbol: string | undefined): StaticImageData {
  return useMemo(() => {
    try {
      if (symbol === 'DEI') {
        return require('/public/static/images/tokens/dei.svg')
      }
      return id
        ? require(`/public/static/images/tickers/${id.toUpperCase()}.png`)
        : require('/public/static/images/fallback/not_found.png')
    } catch (err) {
      return require('/public/static/images/fallback/not_found.png')
    }
  }, [id, symbol])
}
