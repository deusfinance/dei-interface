import React, { useState } from 'react'
import styled from 'styled-components'

// import { useWalletModalToggle } from 'state/application/hooks'
// import useWeb3React from 'hooks/useWeb3'
// import { useSupportedChainId } from 'hooks/useSupportedChainId'

import Hero from 'components/Hero'
import Disclaimer from 'components/Disclaimer'
import ImageWithFallback from 'components/ImageWithFallback'
import MIGRATION_ICON from '/public/static/images/pages/migration/ic_migration.svg'
import SelectBox from 'components/App/Migration/SelectBox'
import MigrationBox from 'components/App/Migration/MigrationBox'
import { RowCenter } from 'components/Row'

const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  overflow: visible;
  margin: 0 auto;
`

export const Wrapper = styled(Container)`
  flex-flow: row wrap;
  margin-top: 20px;
  background: ${({ theme }) => theme.bg1};
  border: 1px solid rgb(0, 0, 0);
  width: 344px;
  height: 472px;
  border-radius: 12px 0px 0px 12px;
`

const TopWrapper = styled(RowCenter)`
  flex-wrap: wrap;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  margin-top: 20px;
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

export default function Migration() {
  // const { chainId, account } = useWeb3React()
  // const toggleWalletModal = useWalletModalToggle()
  // const isSupportedChainId = useSupportedChainId()
  const [activeState, setActiveState] = useState(0)

  return (
    <Container>
      <Hero>
        <ImageWithFallback src={MIGRATION_ICON} width={224} height={133} alt={`Logo`} />
      </Hero>

      <TopWrapper>
        <MigrationsSelectBox>
          <SelectBox activeState={activeState} onTokenSelect={(value: number) => setActiveState(value)} />
        </MigrationsSelectBox>

        <MigrateWrapper>
          <MigrationBox activeState={activeState} />
        </MigrateWrapper>
      </TopWrapper>

      <Disclaimer />
    </Container>
  )
}
