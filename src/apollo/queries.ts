import gql from 'graphql-tag'

export interface SolidlyToken {
  id: string // address
  name: string
  symbol: string
  decimals: string
}

export interface SolidlyPair {
  id: string // address
  name: string
  symbol: string
  decimals: string
  createdAtTimestamp: string
  stable: boolean
  token0: SolidlyToken
  token1: SolidlyToken
}

export interface LiquiditySnapshot {
  timestamp: number
  block: number
  user: string
  token0PriceUSD: string
  token1PriceUSD: string
  reserve0: string
  reserve1: string
  reserveUSD: string
  liquidityTokenTotalSupply: string
  liquidityTokenBalance: string
}

export const SOLIDLY_PAIRS = gql`
  query getSolidlyPairs {
    pairs(first: 1000, orderBy: createdAtTimestamp, orderDirection: desc) {
      id
      name
      symbol
      decimals
      createdAtTimestamp
      stable
      token0 {
        id
        name
        symbol
        decimals
      }
      token1 {
        id
        name
        symbol
        decimals
      }
    }
  }
`

// TODO allow for VWAP'ing
// TODO add skips
export const SOLIDLY_LIQUIDITY_SNAPSHOTS = gql`
  query getSolidlyLiquiditySnapshots($pair: String!) {
    liquidityPositionSnapshots(first: 1000, where: { pair: $pair }, orderBy: timestamp, orderDirection: desc) {
      timestamp
      block
      user
      token0PriceUSD
      token1PriceUSD
      reserve0
      reserve1
      reserveUSD
      liquidityTokenTotalSupply
      liquidityTokenBalance
    }
  }
`

export const SUBGRAPH_HEALTH = gql`
  query health($subgraphName: String!) {
    indexingStatusForCurrentVersion(subgraphName: $subgraphName) {
      synced
      health
      chains {
        chainHeadBlock {
          number
        }
        latestBlock {
          number
        }
      }
    }
  }
`
