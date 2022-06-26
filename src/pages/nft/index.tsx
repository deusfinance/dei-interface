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
import { vDeus } from 'constants/addresses'
import { useVDeusStats } from 'hooks/useVDeusStats'
import VoucherModal from 'components/App/NFT/VoucherModal'

const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  overflow: visible;
  margin: 0 auto;
`

const TopWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;

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
  border-radius: 8px;
  background-color: rgb(13 13 13);
  margin: 20px;
  width: 350px;
  padding: 20px 15px;
  border-radius: 15px;
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
  margin-left: 36px;
  margin-top: 20px;
  font-size: 1.4rem;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: 1.1rem;
  `}
`

const TokensWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 20px;
`

const TokenPreview = styled.span`
  color: ${({ theme }) => theme.warning};
  cursor: pointer;
  margin: 10px 0;
`

const TitleInfo = styled.div`
  padding: 20px;
  padding-top: 0;
  display: flex;
  justify-content: space-between;
  /* border-bottom: 2px solid; */
  border-bottom: ${({ theme }) => `2px solid ${theme.warning}`};
`

const TimeTitle = styled.span`
  color: ${({ theme }) => theme.warning};
  font-size: 1.25rem;
`

export default function NFT() {
  const { chainId, account } = useWeb3React()
  const toggleWalletModal = useWalletModalToggle()
  const isSupportedChainId = useSupportedChainId()
  const [dropDownDefaultValue, setDropDownDefaultValue] = useState('0')
  const [awaitingDepositConfirmation, setAwaitingDepositConfirmation] = useState<boolean>(false)
  const [awaitingWithdrawConfirmation, setAwaitingWithdrawConfirmation] = useState<boolean>(false)
  const [awaitingClaimConfirmation, setAwaitingClaimConfirmation] = useState<boolean>(false)

  const dropdownOnSelect = useCallback((val: string) => {
    console.log('draw down on select', { val })
    return
  }, [])

  const dropdownOptions = [
    { label: 'NFT #1', Value: '1' },
    { label: 'NFT #2', Value: '2' },
    { label: 'NFT #3', Value: '3' },
  ]

  const { numberOfVouchers, listOfVouchers } = useVDeusStats()
  const [currentVoucher, setCurrentVoucher] = useState<number>()
  const toggleVoucherModal = useVoucherModalToggle()

  function handleVoucherClick(flag: number) {
    setCurrentVoucher(flag)
    toggleVoucherModal()
  }

  const deiCurrency = DEI_TOKEN
  const spender = useMemo(() => (chainId ? vDeus[chainId] : undefined), [chainId])

  const [awaitingApproveConfirmation, setAwaitingApproveConfirmation] = useState<boolean>(false)
  const [approvalState, approveCallback] = useApproveCallback(deiCurrency ?? undefined, spender)
  const [showApprove, showApproveLoader] = useMemo(() => {
    const show = deiCurrency && approvalState !== ApprovalState.APPROVED
    return [show, show && approvalState === ApprovalState.PENDING]
  }, [deiCurrency, approvalState])

  const handleApprove = async () => {
    setAwaitingApproveConfirmation(true)
    await approveCallback()
    setAwaitingApproveConfirmation(false)
  }

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

  function getDepositButton(): JSX.Element | null {
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
    return <DepositButton onClick={() => console.log('hello mali')}>Deposit your NFT</DepositButton>
  }

  // function getWithdrawButton(): JSX.Element | null {
  //   if (!chainId || !account) {
  //     return <DepositButton onClick={toggleWalletModal}>Connect Wallet</DepositButton>
  //   }
  //   if (awaitingWithdrawConfirmation) {
  //     return (
  //       <DepositButton>
  //         Withdrawing DEI <DotFlashing style={{ marginLeft: '10px' }} />
  //       </DepositButton>
  //     )
  //   }
  //   return <DepositButton onClick={() => console.log('hello mali from withdraw')}>Withdraw All</DepositButton>
  // }

  function getClaimButton(): JSX.Element | null {
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
    return <DepositButton onClick={() => console.log('hello mali from claim')}>Claim All</DepositButton>
  }

  function getEachPeriod(time: number, apr: number): JSX.Element | null {
    return (
      <>
        <Wrapper>
          <TitleInfo>
            <TimeTitle> {time} Month </TimeTitle>
            <span> Apr: {apr}% </span>
          </TitleInfo>
          <DepositWrapper>
            <span>Select the desired NFT:</span>
            <UpperRow>
              {/* <SearchField searchProps={searchProps} /> */}
              <Dropdown
                options={dropdownOptions}
                placeholder="Select Token ID"
                defaultValue={dropDownDefaultValue}
                onSelect={(v) => dropdownOnSelect(v)}
                width="260px"
              />
            </UpperRow>
            <div style={{ marginTop: '20px' }}></div>
            {getApproveButton()}
            {getDepositButton()}
          </DepositWrapper>

          <WithdrawWrapper>
            <span> Locked NFTs: </span>
            <TokensWrapper>
              {listOfVouchers &&
                listOfVouchers.length > 0 &&
                listOfVouchers.map((voucher: number, index) => {
                  return (
                    <TokenPreview onClick={() => handleVoucherClick(voucher)} key={index}>
                      vDEUS Voucher #{voucher}
                    </TokenPreview>
                  )
                })}
            </TokensWrapper>
            {/* {getWithdrawButton()} */}
          </WithdrawWrapper>

          <ClaimWrapper>
            <RewardSpan> Deus reward: 12.3 </RewardSpan>
            {getClaimButton()}
          </ClaimWrapper>
        </Wrapper>
      </>
    )
  }

  return (
    <Container>
      <Hero>
        <span>vDEUS</span>
        <HeroSubtext>Deposit, withdraw and claim your reward for your NFTs.</HeroSubtext>
      </Hero>
      <TopWrapper>
        {getEachPeriod(3, 73)}
        {getEachPeriod(6, 21)}
        {getEachPeriod(12, 102)}
      </TopWrapper>
      <VoucherModal voucherId={currentVoucher} />
      <Disclaimer />
    </Container>
  )
}
