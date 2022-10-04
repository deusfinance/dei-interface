import React from 'react'
import styled from 'styled-components'

import { useWalletModalToggle } from 'state/application/hooks'
import useWeb3React from 'hooks/useWeb3'
import { useSupportedChainId } from 'hooks/useSupportedChainId'

import { PrimaryButton } from 'components/Button'
import Hero from 'components/Hero'
import Disclaimer from 'components/Disclaimer'
import ImageWithFallback from 'components/ImageWithFallback'
import MIGRATION_ICON from '/public/static/images/pages/migration/ic_migration.svg'
import SelectBox from 'components/App/Migration/Select‌‌‌Box'

const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  overflow: visible;
  margin: 0 auto;
`

const Wrapper = styled(Container)`
  margin-top: 50px;
  width: clamp(250px, 90%, 500px);
  background-color: rgb(13 13 13);
  padding: 20px 15px;
  border: 1px solid rgb(0, 0, 0);
  border-radius: 15px;
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
  & > * {
    &:nth-child(2) {
      margin: 15px auto;
    }
  }
`

const TopWrapper = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
`

const MigrateWrapper = styled.div`
  border-radius: 15px;
  padding: 0;
  & > * {
    /* &:nth-child(1) {
      padding: 0;
      border: 0;
      padding-bottom: 20px;
    } */
  }
`

const MigrationsSelectBox = styled.div`
  display: flex;
  flex-direction: column;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    width: 100%;
    margin: 0 auto;
   
  `}
`

const DepositButton = styled(PrimaryButton)`
  border-radius: 15px;
`

export default function Migration() {
  const { chainId, account } = useWeb3React()
  const toggleWalletModal = useWalletModalToggle()
  const isSupportedChainId = useSupportedChainId()

  return (
    <Container>
      <Hero>
        <ImageWithFallback src={MIGRATION_ICON} width={224} height={133} alt={`Logo`} />
      </Hero>
      <TopWrapper>
        <MigrationsSelectBox>
          <SelectBox />
        </MigrationsSelectBox>

        <MigrateWrapper>
          <SelectBox />
        </MigrateWrapper>
      </TopWrapper>
      <Disclaimer />
    </Container>
  )
}
