import React, { useState, useMemo, useCallback } from 'react'
import styled from 'styled-components'

import { useVoucherModalToggle, useWalletModalToggle } from 'state/application/hooks'
import useWeb3React from 'hooks/useWeb3'
import { useSupportedChainId } from 'hooks/useSupportedChainId'
import useApproveCallback, { ApprovalState } from 'hooks/useApproveCallback'

import { PrimaryButton } from 'components/Button'
import { DotFlashing } from 'components/Icons'
import Hero, { HeroSubtext } from 'components/Hero'
import Disclaimer from 'components/Disclaimer'

import { DEI_TOKEN } from 'constants/tokens'
import Dropdown from 'components/DropDown'
import { RowCenter } from 'components/Row'
import { vDeusStaking } from 'constants/addresses'
import { DefaultHandlerError } from 'utils/parseError'
import { useTransactionAdder } from 'state/transactions/hooks'

import { useUserLockedNfts, useUserPendingTokens, useVDeusStats } from 'hooks/useVDeusStats'
import VoucherModal from 'components/App/NFT/VoucherModal'
import { vDeusStakingPools, vDeusStakingType } from 'constants/stakings'
import { useVDeusMasterChefV2Contract, useVDeusStakingContract } from 'hooks/useContract'
import { toast } from 'react-hot-toast'

const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  overflow: visible;
  margin: 0 auto;
  & > * {
    &:nth-child(2) {
      border-top-left-radius: 15px;
      border-top-right-radius: 15px;
      /* background-color: red; */
    }
    &:last-child {
      border-bottom-left-radius: 15px;
      border-bottom-right-radius: 15px;
      /* background-color: blue; */
    }
  }
`

const TopWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  max-width: 1200px;
  margin: auto;
  ${({ theme }) => theme.mediaWidth.upToLarge`
    display: flex;
    flex-flow: column nowrap;
  `}
`

const Wrapper = styled(Container)`
  /* border: ${({ theme }) => `1px solid ${theme.text3}`}; */
  display: flex;
  justify-content: center;
  flex-direction: column;
  margin-top: 50px;
  padding: 20px 15px;
  border-radius: 15px;

  ${({ theme }) => theme.mediaWidth.upToLarge`
    display: flex;
    justify-content: center;
    flex-direction: column;
  `}
`

const UpperRow = styled(RowCenter)`
  gap: 10px;
  margin: 20px auto;
  height: 50px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    display: flex;
    justify-content: center;
    flex-direction: column;
  `}
  & > * {
    height: 100%;
    max-width: fit-content;
    &:first-child {
      max-width: 400px;
      margin-right: auto;
    }
  }
`

const DepositButton = styled(PrimaryButton)`
  margin-top: 20px;
  border-radius: 15px;
`

const BoxWrapper = styled.div`
  border: ${({ theme }) => `0.5px solid ${theme.text2}`};
  background-color: rgb(13 13 13);
  width: 350px;
  padding: 20px 15px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    margin: 8px;
    width: 290px;
  `}
`

const DepositWrapper = styled(BoxWrapper)`
  align-items: center;
`

const WithdrawWrapper = styled(BoxWrapper)`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
`

const ClaimWrapper = styled(BoxWrapper)`
  /* background: red; */
`

const RewardSpan = styled.span`
  margin-left: auto;
  margin-right: auto;
  margin-top: 20px;
  font-size: 1.4rem;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: 1.1rem;
  `}
`

const TokensWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-top: 20px;
`

const TokenPreview = styled.span`
  color: ${({ theme }) => theme.warning};
  cursor: pointer;
  margin: 10px 5px;
  padding: 5px;
  border-radius: 6px;
  border: ${({ theme }) => `1px solid ${theme.warning}`};
  &:hover {
    background-color: ${({ theme }) => `${theme.bg1}`};
  }
`

const TitleInfo = styled.div`
  padding: 20px;
  padding-top: 0;
  display: flex;
  justify-content: space-between;
  /* border-bottom: 2px solid; */
  /* border-bottom: ${({ theme }) => `2px solid ${theme.warning}`}; */
`

const TimeTitle = styled.span`
  color: ${({ theme }) => theme.warning};
  font-size: 1.25rem;
`

export default function NFT() {
  const { chainId, account } = useWeb3React()
  const toggleWalletModal = useWalletModalToggle()
  const isSupportedChainId = useSupportedChainId()
  const [selectedNftId, setSelectedNftId] = useState('0')
  const [awaitingDepositConfirmation, setAwaitingDepositConfirmation] = useState<boolean>(false)
  const [awaitingClaimConfirmation, setAwaitingClaimConfirmation] = useState<boolean>(false)
  const addTransaction = useTransactionAdder()

  const dropdownOnSelect = useCallback((val: string) => {
    setSelectedNftId(val)
    console.log('draw down on select', { val })
    return
  }, [])

  const { listOfVouchers, numberOfVouchers } = useVDeusStats()
  // console.log({ listOfVouchers, numberOfVouchers })
  const dropdownOptions = listOfVouchers.map((tokenId: number) => ({
    label: `vDEUS #${tokenId}`,
    value: `${tokenId}`,
  }))

  const [currentVoucher, setCurrentVoucher] = useState<number | undefined>()
  const toggleVoucherModal = useVoucherModalToggle()

  function handleVoucherClick(flag: number) {
    setCurrentVoucher(flag)
    toggleVoucherModal()
  }
  const stakingContract = useVDeusStakingContract()
  const masterChefContract = useVDeusMasterChefV2Contract()
  const lockedNFTs = useUserLockedNfts()
  const rewards = useUserPendingTokens()

  const deiCurrency = DEI_TOKEN
  const spender = useMemo(() => (chainId ? vDeusStaking[chainId] : undefined), [chainId])

  const [awaitingApproveConfirmation, setAwaitingApproveConfirmation] = useState<boolean>(false)
  const [approvalState, approveCallback] = useApproveCallback(deiCurrency ?? undefined, spender)
  const [showApprove, showApproveLoader] = useMemo(() => {
    const show = currentVoucher && approvalState !== ApprovalState.APPROVED
    return [show, show && approvalState === ApprovalState.PENDING]
  }, [currentVoucher, approvalState])

  const handleApprove = async () => {
    setAwaitingApproveConfirmation(true)
    await approveCallback()
    setAwaitingApproveConfirmation(false)
  }

  const onClaimReward = useCallback(
    async (pid: number) => {
      try {
        if (!masterChefContract || !account || !isSupportedChainId) return
        setAwaitingClaimConfirmation(true)
        const response = await masterChefContract.harvest(pid, account)
        addTransaction(response, { summary: `Claim Rewards`, vest: { hash: response.hash } })
        setAwaitingClaimConfirmation(false)
        // setPendingTxHash(response.hash)
      } catch (err) {
        console.log(err)
        toast.error(DefaultHandlerError(err))
        setAwaitingClaimConfirmation(false)
        // setPendingTxHash('')
      }
    },
    [masterChefContract, addTransaction, account, isSupportedChainId]
  )

  const onDeposit = useCallback(
    async (pid: number) => {
      try {
        if (!stakingContract || !account || !isSupportedChainId) return
        setAwaitingDepositConfirmation(true)
        const response = await stakingContract.deposit(pid, selectedNftId, account)
        addTransaction(response, { summary: `Deposit vDEUS # ${selectedNftId}`, vest: { hash: response.hash } })
        setAwaitingDepositConfirmation(false)
        // setPendingTxHash(response.hash)
      } catch (err) {
        console.log(err)
        toast.error(DefaultHandlerError(err))
        setAwaitingDepositConfirmation(false)
        // setPendingTxHash('')
      }
    },
    [stakingContract, addTransaction, account, selectedNftId, isSupportedChainId]
  )

  function getApproveButton(): JSX.Element | null {
    if (!isSupportedChainId || !account) {
      return null
    }
    if (awaitingApproveConfirmation) {
      return (
        <DepositButton active>
          Awaiting Confirmation <DotFlashing style={{ marginLeft: '10px' }} />
        </DepositButton>
      )
    }
    if (showApproveLoader) {
      return (
        <DepositButton active>
          Approving <DotFlashing style={{ marginLeft: '10px' }} />
        </DepositButton>
      )
    }
    if (showApprove) {
      return <DepositButton onClick={handleApprove}>Allow us to spend {deiCurrency?.symbol}</DepositButton>
    }
    return null
  }

  function getDepositButton(pid: number): JSX.Element | null {
    if (!chainId || !account) {
      return <DepositButton onClick={toggleWalletModal}>Connect Wallet</DepositButton>
    }
    if (showApprove) {
      return null
    }
    if (awaitingDepositConfirmation) {
      return (
        <DepositButton>
          Depositing DEI <DotFlashing style={{ marginLeft: '10px' }} />
        </DepositButton>
      )
    }
    return <DepositButton onClick={() => onDeposit(pid)}>Deposit your NFT</DepositButton>
  }

  function getClaimButton(pool: vDeusStakingType): JSX.Element | null {
    if (!chainId || !account) {
      return <DepositButton onClick={toggleWalletModal}>Connect Wallet</DepositButton>
    }
    if (awaitingClaimConfirmation) {
      return (
        <DepositButton>
          Claiming DEI <DotFlashing style={{ marginLeft: '10px' }} />
        </DepositButton>
      )
    }
    return <DepositButton onClick={() => onClaimReward(pool.pid)}>Claim All</DepositButton>
  }

  function getEachPeriod(pool: vDeusStakingType): JSX.Element | null {
    return (
      <Wrapper key={pool.name}>
        <TitleInfo>
          <TimeTitle> {pool.name} </TimeTitle>
          <span> Apr: {pool.apr}% </span>
        </TitleInfo>
        <DepositWrapper>
          <span>Select the desired NFT:</span>
          <UpperRow>
            <Dropdown
              options={dropdownOptions}
              placeholder="Select Token ID"
              defaultValue={'0'}
              onSelect={(v) => dropdownOnSelect(v)}
              width="200px"
            />
          </UpperRow>
          <div style={{ marginTop: '20px' }}></div>
          {getApproveButton()}
          {getDepositButton(pool.pid)}
        </DepositWrapper>

        <WithdrawWrapper>
          <span> Locked NFTs: </span>
          <TokensWrapper>
            {lockedNFTs &&
              lockedNFTs[pool.id] &&
              lockedNFTs[pool.id].length > 0 &&
              lockedNFTs[pool.id].map((voucher: number, index) => {
                return (
                  <TokenPreview onClick={() => handleVoucherClick(voucher)} key={index}>
                    #{voucher}
                  </TokenPreview>
                )
              })}
          </TokensWrapper>
          {(!lockedNFTs || !lockedNFTs[pool.id].length) && '-nothing-'}
          {/* {getWithdrawButton()} */}
        </WithdrawWrapper>

        <ClaimWrapper>
          <RewardSpan>Rewards: {rewards[pool.id]} Deus </RewardSpan>
          {getClaimButton(pool)}
        </ClaimWrapper>
      </Wrapper>
    )
  }

  return (
    <Container>
      <Hero>
        <span>vDEUS Staking</span>
        <HeroSubtext>deposit your DEUS voucher and earn.</HeroSubtext>
      </Hero>
      <TopWrapper>{vDeusStakingPools.map((pool) => getEachPeriod(pool))}</TopWrapper>
      <VoucherModal voucherId={currentVoucher} />
      <Disclaimer />
    </Container>
  )
}
