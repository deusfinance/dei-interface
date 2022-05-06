import React, { useEffect, useRef, useState } from 'react'

import Hero, { HeroSubtext } from 'components/Hero'
import Disclaimer from 'components/Disclaimer'
import { SearchField, useSearch } from 'components/App/Borrow'
import { Container, TableSell, Wrapper } from 'components/App/Venft'
import { useFSolidWithdrawData, useVeNFTTokens } from 'hooks/useVeNFT'
import { fromWei } from 'utils/numbers'
import { useVaultCallback, VaultAction } from 'hooks/useVaultCallback'
import { Modal, ModalHeader } from 'components/Modal'
import { PrimaryButton } from 'components/Button'
import styled from 'styled-components'

const ModalWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
`

const MainWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  gap: 0.5rem;
  padding: 1.5rem 1.25rem;
  overflow: visible;
`

const BottomWrapper = styled(MainWrapper)`
  gap: 0.5rem;
`

const ModalMessage = styled.div`
  display: block;
  align-text: center;
  text-align: center;
  font-size: 0.9rem;
  border-radius: 5px;
  padding: 0.7rem;
`
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
          <Modal isOpen={true}>
            <ModalWrapper data-testid="venft-fsolid-withdraw">
              <ModalHeader testid="venft-fsolid-withdraw-token-id" title={`Sell #${tokenId.toNumber()}`} />
              <BottomWrapper>
                <ModalMessage>
                  Your token was successfully sold. You can now withdraw fSolid to your wallet
                </ModalMessage>
                <PrimaryButton data-testid="venft-fsolid-withdraw-action" onClick={handleWithdrawFSolid}>
                  Withdraw{' '}
                  {collateralAmount &&
                    !collateralAmount.isZero() &&
                    `${fromWei(collateralAmount.toNumber()).toString()} fSolid`}
                </PrimaryButton>
              </BottomWrapper>
            </ModalWrapper>
          </Modal>
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
