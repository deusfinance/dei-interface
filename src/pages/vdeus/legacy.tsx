import React from 'react'
import styled from 'styled-components'

import Hero, { HeroSubtext } from 'components/Hero'
import Disclaimer from 'components/Disclaimer'
import { vDeusStakingPools } from 'constants/stakings'
import PoolStake from 'components/App/NFT/PoolStake'
import { PrimaryButton } from 'components/Button'
import { ExternalLink } from 'components/Link'
import WithdrawBox from 'components/App/NFT/WithdrawBox'

const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  overflow: visible;
  margin: 0 auto;
`

const TopWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  max-width: 1200px;
  align-items: flex-start;
  margin: auto;
`

const StakeWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  max-width: 1200px;
  align-items: flex-start;
  margin: auto;

  ${({ theme }) => theme.mediaWidth.upToLarge`
    display: flex;
    flex-flow: column nowrap;
  `}
`

const WarningWrapper = styled.div`
  background: ${({ theme }) => theme.primary1};
  padding: 1px;
  border-radius: 8px;
  margin: 12px;
`

const WarningContainer = styled(PrimaryButton)`
  border-radius: 8px;
  background: ${({ theme }) => theme.bg0};
  height: 100%;

  &:hover {
    cursor: default;
    background: ${({ theme }) => theme.bg0};
    color: ${({ theme }) => theme.text1};
  }
`

export const DISPLAY_WARNING = false

export default function Legacy() {
  return (
    <Container>
      <Hero>
        <span>vDEUS Staking</span>
        <HeroSubtext>deposit your DEUS voucher and earn.</HeroSubtext>
      </Hero>
      <TopWrapper>
        {DISPLAY_WARNING && (
          <WarningWrapper>
            <WarningContainer>
              <div>
                Based on recent events and the communities decision to potentially alter the vDEUS staking, we have
                decided to set them to ZERO until a decision for how to move forward was made. <br />
                For more info, please follow #vdeus-staking channel in{' '}
                <ExternalLink style={{ textDecoration: 'underline' }} href="https://discord.gg/deusfinance">
                  Discord
                </ExternalLink>
                {'.'}
              </div>
            </WarningContainer>
          </WarningWrapper>
        )}
        <WithdrawBox />
        <StakeWrapper>
          {vDeusStakingPools.map((pool) => (
            <PoolStake key={pool.name} pool={pool} flag={false}></PoolStake>
          ))}
        </StakeWrapper>
      </TopWrapper>
      <Disclaimer />
    </Container>
  )
}
