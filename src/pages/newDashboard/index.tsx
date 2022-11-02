import React from 'react'
import styled from 'styled-components'

import LEGACY_DEI from '/public/static/images/pages/dashboard/LEGACY_DEI.svg'
import DEI_LOGO from '/public/static/images/pages/dashboard/ic_dei.svg'

import Hero from 'components/Hero'
import Disclaimer from 'components/Disclaimer'
import { RowBetween, RowCenter } from 'components/Row'
import UserStats from 'components/App/Dashboard/UserStats'
import Stats from 'components/App/Dashboard/Stats'
import { Card } from 'components/App/Dashboard/Card'
import { MigrationStates } from 'constants/migration'
import Box from 'components/App/Migration/Box'
import ImageWithFallback from 'components/ImageWithFallback'
import useWeb3React from 'hooks/useWeb3'

const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  overflow: visible;
  margin: 0 auto;
`

const HeroWrap = styled(Hero)`
  overflow: hidden;
  height: 207px;
  position: relative;
  padding: 0px;
  & > * {
    &:first-child {
      height: 100%;
    }
    &:nth-child(2) {
      position: absolute;
      bottom: 25px;
    }
  }
`

const CardWrapper = styled(RowBetween)`
  width: 100%;
  gap: 20px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    gap: 12px;
    flex-direction: column;
    width: 100%;
  `};
`

const TopWrapper = styled(RowCenter)`
  flex-wrap: wrap;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  margin-top: 20px;

  & > * {
    margin: 10px 0px;
  }
`

export default function Dashboard() {
  const { account } = useWeb3React()

  function swapCardContent(): JSX.Element {
    return <></>
  }

  function migrationCardContent(): JSX.Element {
    return (
      <>
        {MigrationStates.map((migrationState, index) => {
          const { inputToken, outputToken, leverage } = migrationState
          return (
            <Box
              key={index}
              index={index}
              currencyFrom={inputToken}
              currencyTo={outputToken}
              active={false}
              leverage={leverage}
              onTokenSelect={(value: number) => {
                console.log(value)
              }}
            />
          )
        })}
      </>
    )
  }

  function myStakingCardContent(): JSX.Element {
    return <></>
  }

  return (
    <Container>
      <HeroWrap>
        <ImageWithFallback src={DEI_LOGO} width={600} height={425} alt={`Logo`} />
        <ImageWithFallback src={LEGACY_DEI} width={213} height={30} alt={`Logo`} />
      </HeroWrap>

      <TopWrapper>
        {account && <UserStats />}
        <CardWrapper>
          <Card href="/migration" title={'Swap'} subTitle="view all" currentItem={swapCardContent()} />
          <Card href="/bond" title={'Migration'} subTitle="view all" currentItem={migrationCardContent()} />
          <Card href="/vest" title={'My Staking '} subTitle="view all" currentItem={myStakingCardContent()} />
        </CardWrapper>
        <Stats />
      </TopWrapper>

      <Disclaimer />
    </Container>
  )
}
