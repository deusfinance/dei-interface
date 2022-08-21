import React from 'react'
import styled from 'styled-components'

import Hero, { HeroSubtext } from 'components/Hero'
import Disclaimer from 'components/Disclaimer'
import { vDeusStakingPools } from 'constants/stakings'
import PoolStake from 'components/App/NFT/PoolStake'
import { PrimaryButton } from 'components/Button'
import { ExternalLink } from 'components/Link'
import MaintenanceModal from 'components/MaintenanceModal'

const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  overflow: visible;
  margin: 0 auto;
  & > * {
    &:nth-child(2) {
      border-top-left-radius: 15px;
      border-top-right-radius: 15px;
    }
    &:last-child {
      border-bottom-left-radius: 15px;
      border-bottom-right-radius: 15px;
    }
  }
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
  max-width: 1000px;
  border-radius: 8px;
  margin: 12px auto;
`

const WarningContainer = styled(PrimaryButton)`
  border-radius: 8px;
  background: ${({ theme }) => theme.bg0};
  line-height: 24px;
  height: 100%;
  &:hover {
    cursor: default;
    background: ${({ theme }) => theme.bg0};
    color: ${({ theme }) => theme.text1};
  }
`

export const DISPLAY_WARNING = true

export default function NFT() {
  return (
    <>
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
                  {`
                to prepare for the upcoming vDEUS (NFT) > vDEUS (ERC20) migration, DEUS rewards have been swapped with vDEUS(ERC20) rewards, NFT migration will be activated in the upcoming days.
                  A liquidity pool for vDEUS will also be launched very soon.
                  for more information read
                `}
                  <ExternalLink
                    style={{ 'text-decoration': 'underline' }}
                    href="https://lafayettetabor.medium.com/a-wealth-creating-revamped-redeem-plan-601dadcc29a1"
                  >
                    here
                  </ExternalLink>
                  {'.'}
                </div>
              </WarningContainer>
            </WarningWrapper>
          )}
          <StakeWrapper>
            {vDeusStakingPools.map((pool) => (
              <PoolStake key={pool.name} pool={pool} flag={false}></PoolStake>
            ))}
          </StakeWrapper>
        </TopWrapper>
        <Disclaimer />
      </Container>
      {false && (
        <MaintenanceModal
          content="vDEUS rewarder migration should be available again soon.
          You will have to claim() once to start accruing new rewards."
        />
      )}
    </>
  )
}
