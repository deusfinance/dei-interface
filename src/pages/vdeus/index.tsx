import React, { useState, useCallback } from 'react'
import styled from 'styled-components'
import { toast } from 'react-hot-toast'
import { useTransactionAdder } from 'state/transactions/hooks'

import Hero, { HeroSubtext } from 'components/Hero'
import Disclaimer from 'components/Disclaimer'
import { vDeusStakingPools } from 'constants/stakings'
import PoolStake from 'components/App/NFT/PoolStake'
import { PrimaryButton } from 'components/Button'
import { ExternalLink } from 'components/Link'
import { Row, RowBetween } from 'components/Row'
import Column from 'components/Column'
import { NumericalInput } from 'components/Input'
import { DotFlashing } from 'components/Icons'
import { useWalletModalToggle } from 'state/application/hooks'
import useWeb3React from 'hooks/useWeb3'
import { useStakedVDeusStats } from 'hooks/useVDeusStats'
import { useVDeusStakingContract } from 'hooks/useContract'
import { useSupportedChainId } from 'hooks/useSupportedChainId'
import { DefaultHandlerError } from 'utils/parseError'

const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  overflow: visible;
  margin: 0 auto;
`

const WithdrawWrap = styled(Container)`
  width: 98%;
  border: ${({ theme }) => `2px solid ${theme.bg2}`};
  margin: 50px 10px 0 10px;
  padding: 20px;
  border-radius: 15px;
  background: ${({ theme }) => theme.bg0};

  ${({ theme }) => theme.mediaWidth.upToMedium`
    display: flex;
    justify-content: center;
    flex-direction: column;
  `};
`

const WithdrawTitleSpan = styled(Row)`
  font-family: 'IBM Plex Mono';
  font-size: 16px;
  line-height: 21px;
  margin-bottom: 0.75rem;
`

const NFTsRow = styled.div`
  white-space: wrap;
`

const VoucherText = styled.span<{ active: boolean }>`
  margin-right: 12px;
  color: ${({ theme }) => theme.text2};

  ${({ active }) =>
    active &&
    `
    background: -webkit-linear-gradient(90deg, #0badf4 0%, #30efe4 93.4%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
`};
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

const NFTCountWrapper = styled.div`
  background: ${({ theme }) => theme.bg2};
  width: 280px;
  border: 1px solid #444444;
  border-radius: 12px;
  padding: 0.5rem;
  font-size: 10px;

  ${({ theme }) => theme.mediaWidth.upToLarge`
    margin: 2px;
  `}
`

const BoxesRow = styled.div`
  display: flex;
  flex-direction: row;
  padding-top: 20px;
  margin-left: auto;
  margin-right: 0;

  ${({ theme }) => theme.mediaWidth.upToLarge`
    margin: 2px;
    flex-direction: column;
  `}
`

const SelectAllWrap = styled.div`
  cursor: pointer;
  font-weight: 400;
  font-size: 12px;
  color: #ffffff;
`

const NFTsWrap = styled(Column)`
  padding-top: 10px;
`

const MainButton = styled(PrimaryButton)`
  margin-left: 10px;
  width: 280px;
  height: 68px;
  border-radius: 12px;
`

export const DISPLAY_WARNING = false

export default function VDEUS() {
  const { chainId, account } = useWeb3React()
  const toggleWalletModal = useWalletModalToggle()
  const [NFTCount, setNFTCount] = useState(0)
  const [awaitingWithdrawConfirmation, setAwaitingWithdrawConfirmation] = useState(false)
  const stakingContract = useVDeusStakingContract()
  const isSupportedChainId = useSupportedChainId()
  const addTransaction = useTransactionAdder()

  const onWithdrawAllDeposit = useCallback(async () => {
    try {
      if (!stakingContract || !account || !isSupportedChainId) return
      setAwaitingWithdrawConfirmation(true)
      const response = await stakingContract.withdrawAll(NFTCount, account)
      addTransaction(response, { summary: `Withdraw All` })
      setAwaitingWithdrawConfirmation(false)
      // setPendingTxHash(response.hash)
    } catch (err) {
      console.log(err)
      toast.error(DefaultHandlerError(err))
      setAwaitingWithdrawConfirmation(false)
      // setPendingTxHash('')
    }
  }, [stakingContract, NFTCount, addTransaction, account, isSupportedChainId])

  function getActionButton(): JSX.Element | null {
    if (!chainId || !account) {
      return <MainButton onClick={toggleWalletModal}>Connect Wallet</MainButton>
    } else if (awaitingWithdrawConfirmation) {
      return (
        <MainButton>
          Withdrawing NFT{NFTCount > 1 ? 's' : ''} <DotFlashing style={{ marginLeft: '10px' }} />
        </MainButton>
      )
    }
    return <MainButton onClick={() => onWithdrawAllDeposit()}>Withdraw NFT{NFTCount > 1 ? 's' : ''}</MainButton>
  }

  const { numberOfStakedVouchers, listOfStakedVouchers } = useStakedVDeusStats()
  console.log(numberOfStakedVouchers, listOfStakedVouchers)

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
        <WithdrawWrap>
          <WithdrawTitleSpan>You can Withdraw your vDEUS NFTs in this order:</WithdrawTitleSpan>
          <NFTsRow>
            {listOfStakedVouchers.map((voucher, index) => (
              <VoucherText active={index < NFTCount} key={index}>
                {index + 1}.vDEUS #{voucher}
              </VoucherText>
            ))}
          </NFTsRow>
          <Row>
            <BoxesRow>
              <NFTCountWrapper>
                <RowBetween>
                  <p>vDEUS NFT Count</p>
                  <SelectAllWrap onClick={() => setNFTCount(numberOfStakedVouchers)}>
                    Select All {numberOfStakedVouchers}
                  </SelectAllWrap>
                </RowBetween>
                <NFTsWrap>
                  <NumericalInput
                    value={NFTCount || ''}
                    onUserInput={(value: string) => setNFTCount(Number(value))}
                    placeholder="Enter NFT count"
                    autoFocus
                    style={{ textAlign: 'left', height: '50px', fontSize: '1.3rem' }}
                  />
                </NFTsWrap>
              </NFTCountWrapper>
              {getActionButton()}
            </BoxesRow>
          </Row>
        </WithdrawWrap>
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
