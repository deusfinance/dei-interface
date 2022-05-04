import React, { useEffect, useRef, useState } from 'react'

import Hero, { HeroSubtext } from 'components/Hero'
import Disclaimer from 'components/Disclaimer'
import { SearchField, useSearch } from 'components/App/Borrow'
import { Container, TableSell, Wrapper } from 'components/App/Venft'
import { useFSolidWithdrawData, useVeNFTTokens } from 'hooks/useVeNFT'
import { fromWei } from 'utils/numbers'
import { useVaultCallback, VaultAction } from 'hooks/useVaultCallback'

export default function Sell() {
  const { searchProps } = useSearch()
  const { veNFTTokens } = useVeNFTTokens()
  const { tokenId, collateralAmount } = useFSolidWithdrawData()
  const { callback: withdrawFSolid } = useVaultCallback(null, VaultAction.WITHDRAW)
  const [loading, setLoading] = useState(false)

  const mounted = useRef(false)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  const handleWithdrawFSolid = async () => {
    if (loading) return
    setLoading(true)
    try {
      await withdrawFSolid?.()
    } catch (e) {
      console.log('withdraw failed')
      console.log(e)
    }
    if (mounted.current) {
      setLoading(false)
    }
  }
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
            <button data-testid="venft-fsolid-withdraw-action" onClick={handleWithdrawFSolid}>
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
