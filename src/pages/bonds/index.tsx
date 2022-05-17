import React from 'react'
import Link from 'next/link'
import styled from 'styled-components'

import { formatAmount } from 'utils/numbers'

import Hero, { HeroSubtext } from 'components/Hero'
import Disclaimer from 'components/Disclaimer'
import { Table } from 'components/App/Bonds'
import { PrimaryButton } from 'components/Button'
import { RowEnd, RowStart } from 'components/Row'
import useOwnedBonds from 'hooks/useOwnedBonds'
import { useDeiMetrics } from 'state/dashboard/hooks'
import useBonded, { useBondsData } from 'hooks/useBonded'
import { Loader } from 'components/Icons'
import { useBondsOracle } from '../../hooks/useBonded'

const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  overflow: visible;
  margin: 0 auto;
`

const Wrapper = styled(Container)`
  margin: 0 auto;
  margin-top: 50px;
  width: clamp(250px, 90%, 1200px);

  ${({ theme }) => theme.mediaWidth.upToMedium`
    margin-top: 20px;
  `}
`

const UpperRow = styled(RowEnd)`
  gap: 10px;
  margin-bottom: 10px;
  height: 50px;
  & > * {
    height: 100%;
    max-width: fit-content;
    &:first-child {
      max-width: 200px;
      margin-right: auto;
    }
  }
`

const CardWrapper = styled.div`
  display: grid;
  gap: 10px;
  justify-content: space-between;
  grid-template-columns: auto auto;
  overflow: hidden;
  margin-bottom: 10px;
  background: ${({ theme }) => theme.bg1};
  border: 1px solid ${({ theme }) => theme.border1};
  border-radius: 2px;
  padding: 1.5rem 2rem;

  ${({ theme }) => theme.mediaWidth.upToSmall`
  padding: 1rem;
  display: grid;
  row-gap: 20px;
  justify-content: center;
  grid-template-columns: auto;
`}
`

const InfoRow = styled(RowStart)`
  display: flex;
  flex-flow: row nowrap;
  white-space: nowrap;
`

const ItemValue = styled.div`
  color: ${({ theme }) => theme.yellow3};
  margin-left: 5px;
`

export default function Bonds() {
  const bonds = useOwnedBonds()
  const { deiTotalSupply, deiCirculatingSupply } = useDeiMetrics()
  const { deusPrice } = useBondsOracle()
  const { rewards } = useBonded(bonds, deusPrice)
  const { apy } = useBondsData()
  // console.log({ bonds, apy, rewards, deusPrice })

  const bondInfo = [
    { label: 'APY', value: apy == 0 ? '0' : `${apy}%` },
    { label: 'Current Redeem Lower Band', value: '0.374' },
    { label: 'Circulating Supply', value: formatAmount(deiCirculatingSupply) },
    { label: 'Total DEI Supply', value: formatAmount(deiTotalSupply) },
  ]

  return (
    <Container>
      <Hero>
        <div>Bonds</div>
        <HeroSubtext>..........</HeroSubtext>
      </Hero>
      <Wrapper>
        <UpperRow>
          <Link href="/bonds/buy" passHref>
            <PrimaryButton>Buy Bond</PrimaryButton>
          </Link>
        </UpperRow>
        <CardWrapper>
          {bondInfo.map((item, index) => (
            <InfoRow key={index}>
              {item.label}: <ItemValue>{item.value == '0' ? <Loader /> : item.value}</ItemValue>
            </InfoRow>
          ))}
        </CardWrapper>
        <Table bonds={bonds} rewards={rewards} />
      </Wrapper>
      <Disclaimer />
    </Container>
  )
}
