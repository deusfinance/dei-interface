import React, { useMemo } from 'react'
import Link from 'next/link'
import styled from 'styled-components'

import Hero, { HeroSubtext } from 'components/Hero'
import Disclaimer from 'components/Disclaimer'
import { Table } from 'components/App/Vest'
import { PrimaryButton } from 'components/Button'
import useWeb3React from 'hooks/useWeb3'
import { useSupportedChainId } from 'hooks/useSupportedChainId'
import { useSingleContractMultipleData } from 'state/multicall/hooks'
import { useVeDeusContract } from 'hooks/useContract'

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

  & > * {
    &:nth-child(3) {
      margin-bottom: 25px;
      display: flex;
      flex-flow: row nowrap;
      width: 100%;
      gap: 15px;
      & > * {
        &:last-child {
          max-width: 300px;
        }
      }
    }
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    margin-top: 20px;
  `}
`

const CreateButton = styled(PrimaryButton)`
  margin-bottom: 15px;
  max-width: 200px;
  padding: 0px;
  a {
    width: 100%;
    height: 100%;
    padding: 1rem;
  }
`

export default function Vest() {
  const nftIds = useOwnedNfts()

  return (
    <Container>
      <Hero>
        <div>veDEUS</div>
        <HeroSubtext>Happy dilution protection!</HeroSubtext>
      </Hero>
      <Wrapper>
        <CreateButton>
          <Link href="/vest/create" passHref>
            Create Lock
          </Link>
        </CreateButton>
        <Table nftIds={nftIds} />
      </Wrapper>
      <Disclaimer />
    </Container>
  )
}

const idMapping = Array.from(Array(1000).keys())

function useOwnedNfts() {
  const { account, chainId } = useWeb3React()
  const isSupportedChainId = useSupportedChainId()
  const veDEUSContract = useVeDeusContract()

  const callInputs = useMemo(() => {
    return !chainId || !isSupportedChainId || !account ? [] : idMapping.map((id) => [account, id])
  }, [account, chainId, isSupportedChainId])

  const results = useSingleContractMultipleData(veDEUSContract, 'tokenOfOwnerByIndex', callInputs)

  return useMemo(() => {
    return results.reduce((acc: number[], value) => {
      if (!value.result) return acc
      const result = value.result[0].toString()
      if (!result || result == 0) return acc
      acc.push(result)
      return acc
    }, [])
  }, [results])
}
