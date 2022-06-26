import React, { useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'

import { RowBetween } from 'components/Row'
import { Loader } from 'components/Icons'
import { formatAmount, formatDollarAmount } from 'utils/numbers'
import { useVestedAPY } from 'hooks/useVested'
import { getMaximumDate } from 'utils/vest'
import { useDeusPrice } from 'hooks/useCoingeckoPrice'
import { useVDeusStats, VDEUS_USDC_FACTOR } from 'hooks/useVDeusStats'
import StatsModal from './StatsModal'
import { Dashboard } from './DeiStats'
import { useDashboardModalToggle, useVoucherModalToggle } from 'state/application/hooks'
import { ContextError, InvalidContext, useInvalidContext } from 'components/InvalidContext'
import VoucherModal from './VoucherModal'
import { getApolloClient } from 'apollo/client/vdeus'
import { ALL_VOUCHERS, Voucher } from 'apollo/queries'
import useWeb3React from 'hooks/useWeb3'
import { FALLBACK_CHAIN_ID } from 'constants/chains'
import { formatEther } from '@ethersproject/units'

const Wrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  gap: 1rem;
  margin-top: 50px;
  min-width: 750px;
  align-self: center;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    min-width: 0;
    width: 100%;
  `}
`

const TopWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  width: 100%;
  max-width: 750px;
  gap: 2rem;
  justify-content: start;
  margin: 0 auto;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    flex-flow: column nowrap;
  `}
`

const InfoWrapper = styled(RowBetween)<{
  secondary?: boolean
}>`
  align-items: center;
  margin-top: 1px;
  white-space: nowrap;
  margin: auto;
  background-color: #0d0d0d;
  border: 1px solid #1c1c1c;
  border-radius: 15px;
  padding: 1.25rem 2rem;
  font-size: 0.75rem;
  min-width: 500px;
  width: 100%;

  &:hover {
    background: #141414;
    cursor: pointer;
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 0.75rem 1rem;
    width: 90%;
    min-width: 250px;
  `}

  ${({ secondary }) =>
    secondary &&
    `
    min-width: 350px;
  `}
`

const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  align-self: start;
  background-color: #2f2f2f;
  border: 1px solid #0d0d0d;
  border-radius: 15px;
  padding: 1.25rem 1rem;
  font-size: 1rem;
  min-width: 500px;
  width: 100%;
  gap: 1rem;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    width: 90%;
    padding: 0.75rem 0.5rem;
    margin: 0 auto;
    min-width: 265px;
    gap: 0.5rem;
  `}
`

const ItemValue = styled.div`
  display: flex;
  align-self: end;
  color: ${({ theme }) => theme.yellow3};
  margin-left: 5px;

  > span {
    margin-left: 5px;
    color: ${({ theme }) => theme.text1};
  }
`

const Heading = styled.div`
  display: flex;
  align-self: center;
  margin-left: 1rem;
  width: 100%;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    width:90%;
  `}
`

const VoucherWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: space-evenly;
`

// TODO: Subgraphs should read NFT creation tx and send the respective usdc redeemed. until then, this is a ugly fix
// a utility function to adjust usdc redeemed per dei for pre and post dynamic era based on voucher number
export function adjustedUsdcPerDei(y: number, currentTokenId: string) {
  if (parseInt(currentTokenId) > 453) return y //post dynamic era, so the original math applies
  if (parseInt(currentTokenId) > 131) return 0.1 // tranche 3 in pre dynamic era
  if (parseInt(currentTokenId) > 52) return 0.2 // tranche 2 in pre dynamic era
  if (parseInt(currentTokenId) >= 0) return 0.3 // tranche 2 in pre dynamic era
  return 0
}

// a utility function to adjust deus redeemed per dei for pre era based on voucher number
export function adjustedDeusPerDei(y: number, currentTokenId: string) {
  if (parseInt(currentTokenId) > 453) return y //post dynamic era, so the original math applies
  return 2.1 - adjustedUsdcPerDei(y, currentTokenId) // pre dynamic, adjusted their vdeus to offset usdc
}

export default function DeusStats() {
  const { chainId } = useWeb3React()

  const { lockedVeDEUS } = useVestedAPY(undefined, getMaximumDate())
  const deusPrice = useDeusPrice()
  const { numberOfVouchers, listOfVouchers } = useVDeusStats()

  const toggleDashboardModal = useDashboardModalToggle()
  const [currentStat, setCurrentStat] = useState(Dashboard.EMPTY)

  const toggleVoucherModal = useVoucherModalToggle()
  const [currentVoucher, setCurrentVoucher] = useState<number>()

  const invalidContext = useInvalidContext()

  const [allVouchers, setAllVouchers] = useState<Voucher[] | null>(null)

  function handleClick(flag: Dashboard) {
    setCurrentStat(flag)
    toggleDashboardModal()
  }

  function handleVoucherClick(flag: number) {
    setCurrentVoucher(flag)
    toggleVoucherModal()
  }

  const fetchAllVouchers = useCallback(async () => {
    const DEFAULT_RETURN: Voucher[] | null = null
    try {
      const client = getApolloClient(chainId ?? FALLBACK_CHAIN_ID)
      if (!client) return DEFAULT_RETURN

      const { data } = await client.query({
        query: ALL_VOUCHERS,
        variables: { ids: [...listOfVouchers] },
        fetchPolicy: 'no-cache',
      })

      return data.redeems as Voucher[]
    } catch (error) {
      console.log('Unable to fetch voucher details from The Graph Network')
      console.error(error)
      return []
    }
  }, [chainId, listOfVouchers])

  useEffect(() => {
    const getAllVouchers = async () => {
      const result = await fetchAllVouchers()
      setAllVouchers(result)
    }
    getAllVouchers()
  }, [fetchAllVouchers])

  const {
    totalDeiBurned = null,
    totalUsdcRedeemed = null,
    totalDeusRedeemable = null,
  } = useMemo(() => {
    let deiBurn = 0
    let usdcRedeem = 0
    let deusRedeemable = 0
    allVouchers?.map((voucher: Voucher) => {
      deiBurn = deiBurn + Number(formatEther(voucher?.amount || '0'))
      usdcRedeem =
        usdcRedeem +
        Number(formatEther(voucher?.amount || '0')) *
          adjustedUsdcPerDei(parseFloat(voucher?.y || '0'), voucher.currentTokenId)
      deusRedeemable =
        deusRedeemable +
        Number(formatEther(voucher?.amount || '0')) *
          adjustedDeusPerDei(parseFloat(voucher?.y || '0') * VDEUS_USDC_FACTOR, voucher.currentTokenId)
    })

    return {
      totalDeiBurned: deiBurn,
      totalUsdcRedeemed: usdcRedeem,
      totalDeusRedeemable: deusRedeemable,
    }
  }, [allVouchers])

  return (
    <Wrapper>
      <TopWrapper>
        <Container>
          <Heading>DEUS stats</Heading>
          <div onClick={() => handleClick(Dashboard.DEUS_PRICE)}>
            <InfoWrapper>
              <p>DEUS Price</p>
              {deusPrice === null ? <Loader /> : <ItemValue>{formatDollarAmount(parseFloat(deusPrice), 2)}</ItemValue>}
            </InfoWrapper>
          </div>
          <div onClick={() => handleClick(Dashboard.VE_DEUS_LOCKED)}>
            <InfoWrapper>
              <p>Total veDEUS Locked</p>
              {lockedVeDEUS === null ? <Loader /> : <ItemValue>{formatAmount(parseFloat(lockedVeDEUS), 0)}</ItemValue>}
            </InfoWrapper>
          </div>
        </Container>
        {invalidContext !== ContextError.VALID ? (
          <InvalidContext connectText="Connect your wallet to view your vDEUS vouchers" />
        ) : (
          <Container>
            <Heading>vDEUS stats</Heading>
            <div onClick={() => handleClick(Dashboard.VDEUS_NFTS)}>
              <InfoWrapper>
                <p>Total vDEUS Vouchers</p>
                {numberOfVouchers === null ? <Loader /> : <ItemValue>{numberOfVouchers}</ItemValue>}
              </InfoWrapper>
            </div>
            <InfoWrapper>
              <p>Total DEI Burned</p>
              {totalDeiBurned === null ? <Loader /> : <ItemValue>{formatDollarAmount(totalDeiBurned)}</ItemValue>}
            </InfoWrapper>
            <InfoWrapper>
              <p>Total USDC Redeemed</p>
              {totalUsdcRedeemed === null ? <Loader /> : <ItemValue>{formatDollarAmount(totalUsdcRedeemed)}</ItemValue>}
            </InfoWrapper>
            <InfoWrapper>
              <p>Total DEUS Redeemable</p>
              {totalDeusRedeemable === null ? (
                <Loader />
              ) : (
                <ItemValue>{formatDollarAmount(totalDeusRedeemable)}</ItemValue>
              )}
            </InfoWrapper>
            {listOfVouchers && listOfVouchers.length > 0 && <Heading>Vouchers:</Heading>}
            <VoucherWrapper>
              {listOfVouchers &&
                listOfVouchers.length > 0 &&
                listOfVouchers.map((voucher: number, index) => (
                  <div key={index} onClick={() => handleVoucherClick(voucher)}>
                    <InfoWrapper secondary>
                      <ItemValue style={{ margin: 'auto' }}>vDEUS Voucher #{voucher}</ItemValue>
                    </InfoWrapper>
                  </div>
                ))}
            </VoucherWrapper>
          </Container>
        )}
      </TopWrapper>
      <StatsModal stat={currentStat} />
      <VoucherModal voucherId={currentVoucher} />
    </Wrapper>
  )
}
