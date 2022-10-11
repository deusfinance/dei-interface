import React from 'react'
import styled from 'styled-components'
import Image from 'next/image'

import BG_DASHBOARD from '/public/static/images/pages/dashboard/bg.svg'

import { useDeiPrice, useDeusPrice } from 'hooks/useCoingeckoPrice'
import { useDeiStats } from 'hooks/useDeiStats'
import { useVestedAPY } from 'hooks/useVested'

import { formatAmount, formatDollarAmount } from 'utils/numbers'
import { getMaximumDate } from 'utils/vest'

// import { Modal, ModalHeader } from 'components/Modal'
import { RowBetween } from 'components/Row'
import StatsItem from './StatsItem'
import { AMO, CollateralPool, DEI_ADDRESS, USDCReserves1, USDCReserves2, veDEUS } from 'constants/addresses'
import { SupportedChainId } from 'constants/chains'
import { ChainInfo } from 'constants/chainInfo'

const Wrapper = styled(RowBetween)`
  background: ${({ theme }) => theme.bg0};
  align-items: stretch;
  border-radius: 12px;
  padding: 38px 36px;
  padding-left: 14px;
  margin-bottom: 80px;
  position: relative;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    flex-direction: column;
  `};
`

const AllStats = styled.div`
  z-index: 1;
  width: 100%;
  & > * {
    &:nth-child(2) {
      margin-top: 36px;
    }
    &:nth-child(3) {
      margin-top: 36px;
    }
  }
  ${({ theme }) => theme.mediaWidth.upToMedium`
    margin-bottom:25px;
  `};
`

const StatsWrapper = styled.div<{ width?: string }>`
  display: block;
  width: ${({ width }) => width ?? '100%'};
`

const Info = styled(RowBetween)`
  width: 100%;

  gap: 16px 0;
  flex-wrap: wrap;
  & > * {
    margin-top: 16px;
    &:last-child() {
      border-right: none;
    }
  }
  ${({ theme }) => theme.mediaWidth.upToMedium`
    margin:unset;
      & > * {
      &:nth-child(3n) {
        border-right: 1px solid ${({ theme }) => theme.border1};
      }
      &:nth-child(2n) {
        border-right: none;
      }
    }
  `};
`

const Title = styled.span`
  font-family: 'Inter';
  font-size: 20px;
  margin-left: 22px;
  background: ${({ theme }) => theme.deiColor};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    margin-left:11px;
  `};
`

export const DeusTitle = styled(Title)`
  background: ${({ theme }) => theme.deusColor};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`

const LegacyDeiTitle = styled(Title)`
  background: ${({ theme }) => theme.legacyDeiColor};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`

const BackgroundImageWrapper = styled.div`
  position: absolute;
  bottom: 0;
  width: 50%;
  height: 100%;
  right: 10px;
  opacity: 0.7;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    display:none;
  `};
`

// const ModalWrapper = styled.div`
//   display: flex;
//   flex-flow: column nowrap;
//   justify-content: flex-start;
//   gap: 8px;
//   width: 100%;
//   padding: 1.5rem;

//   ${({ theme }) => theme.mediaWidth.upToMedium`
//   padding: 1rem;
// `};

//   > div {
//     margin: 4px 0px;
//   }
// `

// const ModalInfoWrapper = styled(RowBetween)<{
//   active?: boolean
// }>`
//   align-items: center;
//   margin-top: 1px;
//   white-space: nowrap;
//   margin: auto;
//   background-color: #0d0d0d;
//   border: 1px solid #1c1c1c;
//   border-radius: 15px;
//   padding: 1.25rem 2rem;
//   font-size: 0.75rem;
//   min-width: 250px;
//   width: 100%;

//   ${({ theme }) => theme.mediaWidth.upToMedium`
//       padding: 0.75rem 1rem;
//       width: 90%;
//       min-width: 265px;
//     `}
//   ${({ theme, active }) =>
//     active &&
//     `
//     border: 1px solid ${theme.text1};
//   `}
// `

// const ModalItemValue = styled.div`
//   display: flex;
//   align-self: end;
//   color: ${({ theme }) => theme.yellow3};
//   margin-left: 5px;

//   > span {
//     margin-left: 5px;
//     color: ${({ theme }) => theme.text1};
//   }
// `

export default function Stats() {
  const deusPrice = useDeusPrice()
  const {
    totalSupply,
    collateralRatio,
    circulatingSupply,
    totalUSDCReserves,
    totalProtocolHoldings,
    AMOReserve,
    usdcReserves1,
    usdcReserves2,
    usdcPoolReserves,
  } = useDeiStats()

  const { lockedVeDEUS } = useVestedAPY(undefined, getMaximumDate())
  const deiPrice = useDeiPrice()

  //   function getModalBody() {
  //     return (
  //       <ModalWrapper>
  //         <div>DEI Total Reserve Assets are held in three wallets.</div>
  //         <div>Below is the USDC holdings in each wallet.</div>
  //         <ModalInfoWrapper>
  //           <a
  //             href={
  //               ChainInfo[SupportedChainId.FANTOM].blockExplorerUrl + '/address/' + USDCReserves1[SupportedChainId.FANTOM]
  //             }
  //             target={'_blank'}
  //             rel={'noreferrer'}
  //           >
  //             Reserves 1
  //           </a>
  //           {usdcReserves1 === null ? <Loader /> : <ModalItemValue>{formatAmount(usdcReserves1, 2)}</ModalItemValue>}
  //         </ModalInfoWrapper>
  //         <ModalInfoWrapper>
  //           <a
  //             href={
  //               ChainInfo[SupportedChainId.FANTOM].blockExplorerUrl + '/address/' + USDCReserves2[SupportedChainId.FANTOM]
  //             }
  //             target={'_blank'}
  //             rel={'noreferrer'}
  //           >
  //             Reserves 2
  //           </a>
  //           {usdcReserves2 === null ? <Loader /> : <ModalItemValue>{formatAmount(usdcReserves2, 2)}</ModalItemValue>}
  //         </ModalInfoWrapper>
  //         <ModalInfoWrapper>
  //           <a
  //             href={
  //               ChainInfo[SupportedChainId.FANTOM].blockExplorerUrl +
  //               '/address/' +
  //               CollateralPool[SupportedChainId.FANTOM]
  //             }
  //             target={'_blank'}
  //             rel={'noreferrer'}
  //           >
  //             Collateral Pool
  //           </a>
  //           {usdcPoolReserves === null ? (
  //             <Loader />
  //           ) : (
  //             <ModalItemValue>{formatAmount(usdcPoolReserves, 2)}</ModalItemValue>
  //           )}
  //         </ModalInfoWrapper>
  //         <ModalInfoWrapper active>
  //           <p>Total USDC holdings</p>
  //           {totalProtocolHoldings === null ? (
  //             <Loader />
  //           ) : (
  //             <ModalItemValue>{formatAmount(usdcReserves1 + usdcReserves2 + usdcPoolReserves, 2)}</ModalItemValue>
  //           )}
  //         </ModalInfoWrapper>
  //       </ModalWrapper>
  //     )
  //   }

  //   const [toggleDashboardModal, setToggleDashboardModal] = useState(false)

  //   function getModalContent() {
  //     return (
  //       <>
  //         <ModalHeader title={'Total Reserve Assets'} onClose={() => setToggleDashboardModal(false)} />
  //         {getModalBody()}
  //       </>
  //     )
  //   }

  return (
    <>
      <Wrapper>
        <AllStats>
          <StatsWrapper width="90%">
            <LegacyDeiTitle>Legacy DEI Stats</LegacyDeiTitle>
            <Info>
              <StatsItem
                darkBorder={true}
                name="Legacy DEI Price"
                noColor={true}
                value={formatDollarAmount(parseFloat(deiPrice), 3)}
                href="https://www.coingecko.com/en/coins/dei-token"
              />
              <StatsItem
                darkBorder={true}
                name="Total Supply"
                value={formatAmount(totalSupply, 2)}
                noColor={true}
                href={
                  ChainInfo[SupportedChainId.FANTOM].blockExplorerUrl + '/token/' + DEI_ADDRESS[SupportedChainId.FANTOM]
                }
              />
              <StatsItem
                darkBorder={true}
                name="Protocol Holdings"
                value={formatAmount(AMOReserve, 2)}
                noColor={true}
                href={ChainInfo[SupportedChainId.FANTOM].blockExplorerUrl + '/address/'}
              />
              <StatsItem
                darkBorder={true}
                name="Circulating Supply"
                value={formatAmount(circulatingSupply, 2)}
                noColor={true}
                href={
                  ChainInfo[SupportedChainId.FANTOM].blockExplorerUrl + '/token/' + DEI_ADDRESS[SupportedChainId.FANTOM]
                }
              />
              <StatsItem darkBorder={true} name="Total DEI Redeemed" noColor={true} value={'323'} />
              <StatsItem
                name="Redemption per DEI"
                noColor={true}
                darkBorder={true}
                value={formatAmount(collateralRatio, 1).toString() + '%'}
              />
            </Info>
          </StatsWrapper>
          <StatsWrapper width="55%">
            <Title>DEI Stats</Title>
            <Info>
              <StatsItem
                name="DEI Price"
                noColor={true}
                darkBorder={true}
                value={formatDollarAmount(parseFloat(deiPrice), 3)}
                href="https://www.coingecko.com/en/coins/dei-token"
              />
              <StatsItem
                name="Total Supply"
                noColor={true}
                darkBorder={true}
                value={formatAmount(totalSupply, 2)}
                href={
                  ChainInfo[SupportedChainId.FANTOM].blockExplorerUrl + '/token/' + DEI_ADDRESS[SupportedChainId.FANTOM]
                }
              />
              <StatsItem
                name="Total Protocol Holdings"
                value={formatAmount(totalProtocolHoldings, 2)}
                darkBorder={true}
                noColor={true}
              />
              <StatsItem
                name="Market Cap"
                value={formatAmount(circulatingSupply, 2)}
                darkBorder={true}
                noColor={true}
                href={
                  ChainInfo[SupportedChainId.FANTOM].blockExplorerUrl + '/token/' + DEI_ADDRESS[SupportedChainId.FANTOM]
                }
              />
            </Info>
          </StatsWrapper>
          <StatsWrapper width="40%">
            <DeusTitle>DEUS Stats</DeusTitle>
            <Info>
              <StatsItem
                darkBorder={true}
                name="DEUS Price"
                noColor={true}
                value={formatDollarAmount(parseFloat(deusPrice), 2)}
                href={'https://www.coingecko.com/en/coins/deus-finance'}
              />
              <StatsItem name="Total Supply" darkBorder={true} value="650k" noColor={true} />
              <StatsItem darkBorder={true} name="Market Cap" value="N/A" />
            </Info>
          </StatsWrapper>
        </AllStats>
        <BackgroundImageWrapper>
          <Image src={BG_DASHBOARD} alt="swap bg" layout="fill" objectFit="cover" />
        </BackgroundImageWrapper>
      </Wrapper>
      {/* <Modal
        width="500px"
        isOpen={toggleDashboardModal}
        onBackgroundClick={() => setToggleDashboardModal(false)}
        onEscapeKeydown={() => setToggleDashboardModal(false)}
      >
        {getModalContent()}
      </Modal> */}
    </>
  )
}
