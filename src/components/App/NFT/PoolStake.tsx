import React, { useState, useMemo, useCallback, useEffect } from 'react'
import styled from 'styled-components'
import { toast } from 'react-hot-toast'

import { useVoucherModalToggle, useWalletModalToggle } from 'state/application/hooks'
import { useTransactionAdder } from 'state/transactions/hooks'
import useWeb3React from 'hooks/useWeb3'
import { useSupportedChainId } from 'hooks/useSupportedChainId'
import { useVDeusMasterChefV2Contract, useVDeusStakingContract } from 'hooks/useContract'
import { useERC721ApproveAllCallback, ApprovalState } from 'hooks/useApproveNftCallback2'
import { useVDeusStats } from 'hooks/useVDeusStats'
import useCurrencyLogo from 'hooks/useCurrencyLogo'
import { useGetApr, useUserInfo } from 'hooks/useVDeusStaking'

import { DefaultHandlerError } from 'utils/parseError'
import { vDeusStakingType } from 'constants/stakings'
import { vDeus, vDeusStaking } from 'constants/addresses'
import { DEUS_TOKEN } from 'constants/tokens'

import ImageWithFallback from 'components/ImageWithFallback'
import { PrimaryButton } from 'components/Button'
import { DotFlashing } from 'components/Icons'
import Dropdown from 'components/DropDown'
import { Row, RowCenter } from 'components/Row'

// import VoucherModal from 'components/App/NFT/VoucherModal'
// import { formatDollarAmount } from 'utils/numbers'

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
  justify-content: flex-start;
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

const ClaimWrapper = styled(BoxWrapper)`
  margin: 0 auto;
`

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
  flex-direction: row;
  justify-content: center;
  padding-top: 20px;
  padding-bottom: 20px;
  margin: 0 auto;
  font-size: 1.4rem;
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

export default function PoolStake({ pool }: { pool: vDeusStakingType }) {
  const { chainId, account } = useWeb3React()
  const toggleWalletModal = useWalletModalToggle()
  const isSupportedChainId = useSupportedChainId()
  const [selectedNftId, setSelectedNftId] = useState('0')
  const [dropDownDefaultValue, setDropDownDefaultValue] = useState<string | undefined>('0')
  const [awaitingDepositConfirmation, setAwaitingDepositConfirmation] = useState<boolean>(false)
  const [awaitingClaimConfirmation, setAwaitingClaimConfirmation] = useState<boolean>(false)
  const addTransaction = useTransactionAdder()
  const logo = useCurrencyLogo(DEUS_TOKEN.address)

  const dropdownOnSelect = useCallback((val: string) => {
    setSelectedNftId(val)
    setDropDownDefaultValue(val)
    // console.log('draw down on select', { val })
    return
  }, [])

  const { listOfVouchers, numberOfVouchers } = useVDeusStats()

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

  //   const dropDownOpDefa = useMemo(() => {
  //     console.log('drop down optionnns')
  //     if (dropdownOptions.length && selectedNftId !== dropdownOptions[0].value) return selectedNftId
  //     if (dropdownOptions.length) return dropdownOptions[0].value
  //     return null
  //   }, [dropdownOptions, selectedNftId])

  const [currentVoucher, setCurrentVoucher] = useState<number | undefined>()
  const toggleVoucherModal = useVoucherModalToggle()

  // console.log({ currentVoucher, selectedNftId, dropDownDefaultValue })
  function handleVoucherClick(flag: number) {
    setCurrentVoucher(flag)
    toggleVoucherModal()
  }
  const stakingContract = useVDeusStakingContract()
  const masterChefContract = useVDeusMasterChefV2Contract()
  // const lockedNFTs = useUserLockedNfts()
  const { depositAmount, rewardsAmount } = useUserInfo(pool.pid)

  const apr = useGetApr(pool.pid)
  const spender = useMemo(() => (chainId ? vDeusStaking[chainId] : undefined), [chainId])

  const [awaitingApproveConfirmation, setAwaitingApproveConfirmation] = useState<boolean>(false)

  const [approvalState, approveCallback] = useERC721ApproveAllCallback(chainId ? vDeus[chainId] : undefined, spender)

  const showApprove = useMemo(() => approvalState !== ApprovalState.APPROVED, [approvalState])

  const handleApprove = async () => {
    setAwaitingApproveConfirmation(true)
    await approveCallback()
    setAwaitingApproveConfirmation(false)
  }

  useEffect(() => {
    setDropDownDefaultValue(undefined)
  }, [])

  const onClaimReward = useCallback(
    async (pid: number) => {
      try {
        if (!masterChefContract || !account || !isSupportedChainId || !rewardsAmount) return
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
    [masterChefContract, account, isSupportedChainId, rewardsAmount, pool.id, addTransaction]
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
  console.log('====================================')
  console.log({ selectedNftId })
  console.log('====================================')
  function getApproveButton(): JSX.Element | null {
    if (!isSupportedChainId || !account) {
      return null
    }

    if (selectedNftId == '0') {
      return <DepositButton disabled={true}>Select an NFT</DepositButton>
    }

    if (awaitingApproveConfirmation) {
      return (
        <DepositButton active>
          Awaiting Confirmation <DotFlashing style={{ marginLeft: '10px' }} />
        </DepositButton>
      )
    }

    if (showApprove) {
      return <DepositButton onClick={handleApprove}>Approve vDEUS</DepositButton>
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
    if (rewardsAmount <= 0) {
      return <DepositButton disabled={true}>Claim</DepositButton>
    }
    return <DepositButton onClick={() => onClaimReward(pool.pid)}>Claim</DepositButton>
  }

  return (
    <Wrapper>
      <TitleInfo>
        <TimeTitle>{pool.name}</TimeTitle>
        <YieldTitle>Apr: {apr}%</YieldTitle>
      </TitleInfo>
      <DepositWrapper>
        <span>Select your desired NFT:</span>
        <UpperRow>
          <Dropdown
            options={dropdownOptions}
            placeholder="select an NFT"
            defaultValue={dropDownDefaultValue}
            onSelect={(v) => dropdownOnSelect(v)}
            width="250px"
          />
        </UpperRow>
        <div style={{ marginTop: '20px' }}></div>
        {getApproveButton()}
        {getDepositButton(pool.pid)}
      </DepositWrapper>
      {depositAmount > 0 && (
        <WithdrawWrapper>
          <span> Total Deposited: </span>
          {/* <span style={{ marginTop: '15px' }}>{formatDollarAmount(depositAmount)}</span> */}
          <span style={{ marginTop: '15px' }}>${depositAmount}</span>
        </WithdrawWrapper>
      )}

      <ClaimWrapper>
        <span>Reward</span>
        <RewardData>
          <span>{rewardsAmount && rewardsAmount?.toFixed(2)}</span>
          <Row style={{ marginLeft: '25px' }}>
            <ImageWithFallback src={logo} width={22} height={22} alt={'Logo'} round />
            <span style={{ marginLeft: '6px' }}>{DEUS_TOKEN.symbol}</span>
          </Row>
        </RewardData>
        {getClaimButton(pool)}
      </ClaimWrapper>
      {/* <VoucherModal voucherId={currentVoucher} /> */}
    </Wrapper>
  )
}
