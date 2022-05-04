import React from 'react'

import Hero, { HeroSubtext } from 'components/Hero'
import Disclaimer from 'components/Disclaimer'
import { SearchField, useSearch } from 'components/App/Borrow'
import { Container, TableSell, Wrapper } from 'components/App/Venft'
import { useFSolidWithdrawData, useVeNFTTokens } from 'hooks/useVeNFT'
import { fromWei } from 'utils/numbers'

export default function Sell() {
  const { searchProps } = useSearch()
  const { veNFTTokens } = useVeNFTTokens()
  const { tokenId, collateralAmount } = useFSolidWithdrawData()
  return (
    <Container>
      <Hero>
        <div>SELL veNFT</div>
        <HeroSubtext>Sell veNFT</HeroSubtext>
      </Hero>
      <Wrapper>
        {tokenId && !tokenId.isZero() ? (
          <div data-testid="venft-fsolid-withdraw">
            <div data-testid="venft-fsolid-withdraw-token-id">{tokenId.toNumber()}</div>
            <button data-testid="venft-fsolid-withdraw-action">
              Withdraw{' '}
              {collateralAmount && !collateralAmount.isZero() && (
                <span data-testid="venft-fsolid-withdraw-amount">
                  `${parseFloat(fromWei(collateralAmount.toNumber()))} fSolid`
                </span>
              )}
            </button>
          </div>
        ) : (
          <>
            <div>
              <SearchField searchProps={searchProps} />
            </div>
            <TableSell veNFTTokens={veNFTTokens} />
          </>
        )}
      </Wrapper>
      <Disclaimer />
    </Container>
  )
}
