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
import { RowCenter } from 'components/Row'

const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  overflow: visible;
  margin: 0 auto;
`

const Wrapper = styled(Container)`
  margin-top: 50px;
  /* width: clamp(250px, 90%, 500px); */
  border-radius: 12px;
  flex-flow: row nowrap;
  border-bottom-right-radius: 0;
`

const TopWrapper = styled(RowCenter)`
  flex-wrap: wrap;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
`

const MigrateWrapper = styled.div`
  border-radius: 12px;
  padding: 0;
`

const MigrationsSelectBox = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: 12px 0px 0px 12px;
  /* width: 344px;
  height: 472px; */
  overflow: scroll;

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
      <Wrapper>
        <TopWrapper>
          <MigrationsSelectBox>
            <SelectBox />
          </MigrationsSelectBox>

          <MigrateWrapper>
            {/* Hello */}
            {/* put your code here */}
          </MigrateWrapper>
        </TopWrapper>
      </Wrapper>
      <Disclaimer />
    </Container>
  )
}
