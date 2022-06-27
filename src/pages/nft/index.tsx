import React, { useState, useMemo, useCallback } from 'react'
import styled from 'styled-components'

import { useVoucherModalToggle, useWalletModalToggle } from 'state/application/hooks'
import useWeb3React from 'hooks/useWeb3'
import { useSupportedChainId } from 'hooks/useSupportedChainId'
import { ApprovalState } from 'hooks/useApproveCallback'

import { PrimaryButton } from 'components/Button'
import { DotFlashing } from 'components/Icons'
import Hero, { HeroSubtext } from 'components/Hero'
import Disclaimer from 'components/Disclaimer'

import Dropdown from 'components/DropDown'
import { Row, RowCenter } from 'components/Row'
import { vDeus, vDeusStaking } from 'constants/addresses'
import { DefaultHandlerError } from 'utils/parseError'
import { useTransactionAdder } from 'state/transactions/hooks'

import { useUserLockedNfts, useUserPendingTokens, useVDeusStats } from 'hooks/useVDeusStats'
import VoucherModal from 'components/App/NFT/VoucherModal'
import { vDeusStakingPools, vDeusStakingType } from 'constants/stakings'
import { useVDeusMasterChefV2Contract, useVDeusStakingContract } from 'hooks/useContract'
import { toast } from 'react-hot-toast'
import useApproveNftCallback from 'hooks/useApproveNftCallback'
import ImageWithFallback from 'components/ImageWithFallback'
import useCurrencyLogo from 'hooks/useCurrencyLogo'
import { DEUS_TOKEN } from 'constants/tokens'

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
  flex-flow: row nowrap;
  max-width: 1200px;
  margin: auto;
  ${({ theme }) => theme.mediaWidth.upToLarge`
    display: flex;
    flex-flow: column nowrap;
  `}
`

const Wrapper = styled(Container)`
  display: flex;
  justify-content: center;
  flex-direction: column;
  margin-top: 50px;
  padding: 20px 15px;
  border-radius: 15px;
  /* border: ${({ theme }) => `1px solid ${theme.bg1}`}; */
  background: ${({ theme }) => theme.bg0};
  margin-left: 10px;
  margin-right: 10px;

  ${({ theme }) => theme.mediaWidth.upToLarge`
    display: flex;
    justify-content: center;
    flex-direction: column;
  `};
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
  margin-top: 12px;
  margin-bottom: 16px;
  border-radius: 5px;
  width: 255px;
  height: 55px;
`

const BoxWrapper = styled.div`
  border: ${({ theme }) => `0.5px solid ${theme.text2}`};
  background-color: rgb(13 13 13);
  width: 350px;
  padding: 20px 15px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    width: 290px;
  `}
`

const DepositWrapper = styled(BoxWrapper)``

const WithdrawWrapper = styled(BoxWrapper)`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
`

const ClaimWrapper = styled(BoxWrapper)``

const RewardSpan = styled.span`
  margin-bottom: 20px;
  /* font-size: 1.4rem; */
  /* gap: 10px; */

  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: 1.1rem;
  `}
`

const RewardData = styled.div`
  display: flex;
  flex-direction: row nowrap;
  justify-content: space-between;
  padding-top: 20px;
  padding-bottom: 20px;
  margin: 0 auto;
  width: 125px;
  font-size: 1.4rem;
`

const TokensWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-top: 20px;
`

const TokenWrapper = styled.div``

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

const YieldTitle = styled.div`
  color: ${({ theme }) => theme.warning};
  font-size: 1.25rem;
`

const TitleInfo = styled.div`
  padding: 20px;
  padding-top: 0;
  display: flex;
  justify-content: space-between;
`

const TimeTitle = styled.span`
  /* color: ${({ theme }) => theme.warning}; */
  font-size: 1.25rem;
`

const RewardTitle = styled.span``

export default function NFT() {
  const { chainId, account } = useWeb3React()
  const toggleWalletModal = useWalletModalToggle()
  const isSupportedChainId = useSupportedChainId()
  const [selectedNftId, setSelectedNftId] = useState('0')
  const [dropDownDefaultValue, setDropDownDefaultValue] = useState('0')
  const [awaitingDepositConfirmation, setAwaitingDepositConfirmation] = useState<boolean>(false)
  const [awaitingClaimConfirmation, setAwaitingClaimConfirmation] = useState<boolean>(false)
  const addTransaction = useTransactionAdder()
  const logo = useCurrencyLogo(DEUS_TOKEN.address)

  const dropdownOnSelect = useCallback((val: string) => {
    setSelectedNftId(val)
    setDropDownDefaultValue(val)
    console.log('draw down on select', { val })
    return
  }, [])

  const { listOfVouchers } = useVDeusStats()

  // const dropdownOptions = useMemo(() => {
  //   return listOfVouchers.map((tokenId: number) => {
  //     return {
  //       label: `vDEUS #${tokenId}`,
  //       value: `${tokenId}`,
  //     }
  //   })
  // }, [listOfVouchers])

  const dropdownOptions = listOfVouchers.map((tokenId: number) => ({
    label: `vDEUS #${tokenId}`,
    value: `${tokenId}`,
  }))

  const [currentVoucher, setCurrentVoucher] = useState<number | undefined>()
  const toggleVoucherModal = useVoucherModalToggle()

  // console.log({ currentVoucher, selectedNftId, dropDownDefaultValue })
  function handleVoucherClick(flag: number) {
    setCurrentVoucher(flag)
    toggleVoucherModal()
  }
  const stakingContract = useVDeusStakingContract()
  const masterChefContract = useVDeusMasterChefV2Contract()
  const lockedNFTs = useUserLockedNfts()
  const rewards = useUserPendingTokens()
  console.log({ lockedNFTs })

  const spender = useMemo(() => (chainId ? vDeusStaking[chainId] : undefined), [chainId])

  const [awaitingApproveConfirmation, setAwaitingApproveConfirmation] = useState<boolean>(false)

  const [approvalState, approveCallback] = useApproveNftCallback(
    selectedNftId,
    chainId ? vDeus[chainId] : undefined,
    spender
  )

  const [showApprove, showApproveLoader] = useMemo(() => {
    const show = selectedNftId && approvalState !== ApprovalState.APPROVED
    return [show, show && approvalState === ApprovalState.PENDING]
  }, [selectedNftId, approvalState])

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
        addTransaction(response, { summary: `Deposit vDEUS #${selectedNftId}` })
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
      return <DepositButton onClick={handleApprove}>Allow us to spend vDEUS #{selectedNftId}</DepositButton>
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
          Depositing <DotFlashing style={{ marginLeft: '10px' }} />
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
          Claiming <DotFlashing style={{ marginLeft: '10px' }} />
        </DepositButton>
      )
    }
    return <DepositButton onClick={() => onClaimReward(pool.pid)}>Claim All</DepositButton>
  }

  function getEachPeriod(pool: vDeusStakingType): JSX.Element | null {
    return (
      <Wrapper key={pool.name}>
        <TitleInfo>
          <TimeTitle>{pool.name}</TimeTitle>
          <YieldTitle>Apr: {pool.apr}%</YieldTitle>
        </TitleInfo>
        <DepositWrapper>
          <span>Select your desired NFT:</span>
          <UpperRow>
            <Dropdown
              options={dropdownOptions}
              placeholder="Select Token ID"
              defaultValue={dropDownDefaultValue}
              onSelect={(v) => dropdownOnSelect(v)}
              width="250px"
            />
          </UpperRow>
          <div style={{ marginTop: '20px' }}></div>
          {getApproveButton()}
          {getDepositButton(pool.pid)}
        </DepositWrapper>

        {/* {!lockedNFTs || lockedNFTs[pool.id].length ? (
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
          </WithdrawWrapper>
        ) : (
          <></>
        )} */}

        <ClaimWrapper>
          <span>Reward</span>
          <RewardData>
            <span>{rewards[pool.id]}</span>
            <Row style={{ marginLeft: '25px' }}>
              <ImageWithFallback src={logo} width={22} height={22} alt={'Logo'} round />
              <span style={{ marginLeft: '6px' }}>{DEUS_TOKEN.symbol}</span>
            </Row>
          </RewardData>
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
