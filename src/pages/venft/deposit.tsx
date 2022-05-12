import React from 'react'
import Link from 'next/link'

import Hero, { HeroSubtext } from 'components/Hero'
import Disclaimer from 'components/Disclaimer'
import { Container, SearchField, TableDeposit, useSearch, Wrapper } from 'components/App/Venft'
import { useFSolidWithdrawData, useVeNFTTokens } from 'hooks/useVeNFT'
import styled from 'styled-components'
import { Modal, ModalHeader } from 'components/Modal'
import { PrimaryButton } from 'components/Button'

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
export default function Deposit() {
  const { searchProps } = useSearch()
  const { veNFTTokens } = useVeNFTTokens()
  const { useLockPendingTokenId } = useFSolidWithdrawData()

  return (
    <Container data-testid="venft-deposit-page">
      <Hero>
        <div>SELL veNFT</div>
        <HeroSubtext>Sell veNFT</HeroSubtext>
      </Hero>
      <Wrapper>
        {useLockPendingTokenId && !useLockPendingTokenId.isZero() && (
          <Modal isOpen={true}>
            <ModalWrapper data-testid="venft-deposit-lock">
              <ModalHeader testid="venft-deposit-lock-token-id" title={`Lock #${useLockPendingTokenId.toNumber()}`} />
              <BottomWrapper>
                <ModalMessage>Your token was successfully deposited. You can now vote and lock your NFT.</ModalMessage>
                <Link href={`/vote?tokenId=${useLockPendingTokenId.toNumber()}`}>
                  <PrimaryButton data-testid="venft-deposit-lock-action">Go to Vote</PrimaryButton>
                </Link>
              </BottomWrapper>
            </ModalWrapper>
          </Modal>
        )}
        <div>
          <SearchField searchProps={searchProps} />
        </div>
        <TableDeposit veNFTTokens={veNFTTokens} />
      </Wrapper>
      <Disclaimer />
    </Container>
  )
}
