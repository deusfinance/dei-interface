import React, { useState, useMemo, useCallback } from 'react'
import styled from 'styled-components'
import { toast } from 'react-hot-toast'

import { useWalletModalToggle } from 'state/application/hooks'
import { useTransactionAdder } from 'state/transactions/hooks'
import useWeb3React from 'hooks/useWeb3'
import { useSupportedChainId } from 'hooks/useSupportedChainId'
import { useMasterChefContract } from 'hooks/useContract'
import useApproveCallback, { ApprovalState } from 'hooks/useApproveCallback'
import { useUserInfo } from 'hooks/useStakingInfo'

import { DefaultHandlerError } from 'utils/parseError'
import { formatBalance, toBN } from 'utils/numbers'

import { Row } from 'components/Row'
import { PrimaryButton } from 'components/Button'
import { DotFlashing } from 'components/Icons'
import InputBox from '../Redemption/InputBox'
import { tryParseAmount } from 'utils/parse'
import { useCurrencyBalance } from 'state/wallet/hooks'
import Navigation, { NavigationTypes } from '../Stake/Navigation'
import { StakingType } from 'constants/stakings'

const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  overflow: visible;
  margin: 0 auto;
`

const Wrapper = styled(Container)`
  margin: 0 auto;
  margin-top: 50px;
  width: clamp(250px, 90%, 500px);
  background-color: rgb(13 13 13);
  padding: 20px 15px 0 15px;
  border: 1px solid rgb(0, 0, 0);
  border-radius: 15px;
  justify-content: center;
`

const DepositButton = styled(PrimaryButton)`
  margin-top: 20px;
  margin-bottom: 20px;
  border-radius: 12px;
`

const ClaimButtonWrapper = styled.div`
  background: ${({ theme }) => theme.primary1};
  padding: 1px;
  border-radius: 8px;
  height: 40px;
`

const ClaimButton = styled(PrimaryButton)`
  border-radius: 8px;
  background: ${({ theme }) => theme.bg0};
  height: 100%;

  &:hover {
    & > * {
      &:first-child {
        color: ${({ theme }) => theme.text2};
        -webkit-text-fill-color: black;
        font-weight: 900;
      }
    }
  }
`

const SelectorContainer = styled.div`
  display: flex;
  flex-flow: column nowrap;
  margin-left: -30px;
`

const BoxWrapper = styled.div`
  padding: 20px 10px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
`

const Line = styled.div`
  height: 1px;
  width: clamp(250px, 110%, 500px);
  margin-left: -16px;
  background: ${({ theme }) => theme.bg2};
`

const RewardData = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  padding-top: 6px;
  padding-bottom: 8px;
  margin: 0 auto;
  font-size: 14px;
  background: -webkit-linear-gradient(90deg, #0badf4 0%, #30efe4 93.4%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`

const YieldTitle = styled.div`
  background: -webkit-linear-gradient(90deg, #e29c53 0%, #ce4c7a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 900;
  font-size: 24px;
  font-family: 'IBM Plex Mono';
  word-spacing: -12px;
`

const TitleInfo = styled.div`
  padding: 20px;
  padding-top: 5px;
  display: flex;
  justify-content: space-between;
  font-family: 'IBM Plex Mono';
  margin-bottom: 40px;
`

const ButtonText = styled.span`
  background: -webkit-linear-gradient(90deg, #e29c53 0%, #ce4c7a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`

const AmountSpan = styled.span`
  color: ${({ theme }) => theme.nude};
`

export default function GeneralStaking({ stakingPool }: { stakingPool: StakingType }) {
  const { chainId, account } = useWeb3React()
  const toggleWalletModal = useWalletModalToggle()
  const { token: currency, pid } = stakingPool

  const isSupportedChainId = useSupportedChainId()
  const [amountIn, setAmountIn] = useState('')
  const currencyBalance = useCurrencyBalance(account ?? undefined, currency)

  //todo get block reward per block/seconds
  const masterChefContract = useMasterChefContract(stakingPool)

  const addTransaction = useTransactionAdder()

  const { rewardsAmount, depositAmount, totalDepositedAmount, rewardToken } = useUserInfo(stakingPool)

  const apr = stakingPool.aprHook(stakingPool)

  const currencyAmount = useMemo(() => {
    return tryParseAmount(amountIn, currency || undefined)
  }, [amountIn, currency])

  const insufficientBalance = useMemo(() => {
    if (!currencyAmount) return false
    return currencyBalance?.lessThan(currencyAmount)
  }, [currencyBalance, currencyAmount])

  const [awaitingApproveConfirmation, setAwaitingApproveConfirmation] = useState(false)
  const [awaitingDepositConfirmation, setAwaitingDepositConfirmation] = useState(false)
  const [awaitingWithdrawConfirmation, setAwaitingWithdrawConfirmation] = useState(false)
  const [awaitingClaimConfirmation, setAwaitClaimConfirmation] = useState(false)

  const [selected, setSelected] = useState<NavigationTypes>(NavigationTypes.STAKE)

  const spender = useMemo(() => stakingPool.masterChef, [stakingPool.masterChef])
  const [approvalState, approveCallback] = useApproveCallback(currency ?? undefined, spender)

  const [showApprove, showApproveLoader] = useMemo(() => {
    const show = currency && approvalState !== ApprovalState.APPROVED
    return [show, show && approvalState === ApprovalState.PENDING]
  }, [currency, approvalState])

  const handleApprove = async () => {
    setAwaitingApproveConfirmation(true)
    await approveCallback()
    setAwaitingApproveConfirmation(false)
  }

  const onClaimReward = useCallback(async () => {
    try {
      if (!masterChefContract || !account || !isSupportedChainId) return
      setAwaitClaimConfirmation(true)
      const response = await masterChefContract.harvest(pid, account)
      addTransaction(response, { summary: `Claim Rewards` })
      setAwaitClaimConfirmation(false)
      // setPendingTxHash(response.hash)
    } catch (err) {
      console.log(err)
      toast.error(DefaultHandlerError(err))
      setAwaitClaimConfirmation(false)
      // setPendingTxHash('')
    }
  }, [masterChefContract, addTransaction, pid, account, isSupportedChainId])

  const onDeposit = useCallback(async () => {
    try {
      if (!masterChefContract || !account || !isSupportedChainId || !amountIn) return
      setAwaitingDepositConfirmation(true)
      const response = await masterChefContract.deposit(pid, toBN(amountIn).times(1e18).toFixed(), account)
      addTransaction(response, { summary: `Deposit ${amountIn} ${currency.symbol}` })
      setAwaitingDepositConfirmation(false)
      setAmountIn('')
      // setPendingTxHash(response.hash)
    } catch (err) {
      console.log(err)
      toast.error(DefaultHandlerError(err))
      setAwaitingDepositConfirmation(false)
      // setPendingTxHash('')
    }
  }, [masterChefContract, addTransaction, pid, account, isSupportedChainId, amountIn, currency])

  const onWithdraw = useCallback(async () => {
    try {
      if (!masterChefContract || !account || !isSupportedChainId || !amountIn) return
      setAwaitingWithdrawConfirmation(true)
      const response = await masterChefContract.withdraw(pid, toBN(amountIn).times(1e18).toFixed(), account)
      addTransaction(response, { summary: `Withdraw ${amountIn} ${currency.symbol}` })
      setAwaitingWithdrawConfirmation(false)
      setAmountIn('')
      // setPendingTxHash(response.hash)
    } catch (err) {
      console.log(err)
      toast.error(DefaultHandlerError(err))
      setAwaitingWithdrawConfirmation(false)
      // setPendingTxHash('')
    }
  }, [masterChefContract, addTransaction, pid, account, isSupportedChainId, amountIn, currency])

  function getApproveButton(): JSX.Element | null {
    if (!isSupportedChainId || !account) {
      return null
    } else if (awaitingApproveConfirmation) {
      return (
        <DepositButton active>
          Awaiting Confirmation <DotFlashing />
        </DepositButton>
      )
    } else if (showApproveLoader) {
      return (
        <DepositButton active>
          Approving <DotFlashing />
        </DepositButton>
      )
    } else if (showApprove) {
      return <DepositButton onClick={handleApprove}>Allow us to spend {currency?.symbol}</DepositButton>
    }
    return null
  }

  function getActionButton(): JSX.Element | null {
    if (!chainId || !account) {
      return <DepositButton onClick={toggleWalletModal}>Connect Wallet</DepositButton>
    } else if (showApprove) {
      return null
    } else if (insufficientBalance && selected === NavigationTypes.STAKE) {
      return <DepositButton disabled>Insufficient {currency?.symbol} Balance</DepositButton>
    } else if (awaitingDepositConfirmation) {
      return (
        <DepositButton>
          Staking <DotFlashing />
        </DepositButton>
      )
    } else if (awaitingWithdrawConfirmation) {
      return (
        <DepositButton>
          Unstaking <DotFlashing />
        </DepositButton>
      )
    } else {
      if (selected === NavigationTypes.STAKE) {
        return <DepositButton onClick={() => onDeposit()}>Stake {currency?.symbol}</DepositButton>
      } else {
        return <DepositButton onClick={() => onWithdraw()}>Unstake {currency?.symbol}</DepositButton>
      }
    }
  }

  function getClaimButton(): JSX.Element | null {
    if (awaitingClaimConfirmation) {
      return (
        <ClaimButtonWrapper>
          <ClaimButton disabled={true}>
            <ButtonText>
              Claim
              <DotFlashing />
            </ButtonText>
          </ClaimButton>
        </ClaimButtonWrapper>
      )
    }
    if (rewardsAmount <= 0) {
      return (
        <ClaimButtonWrapper>
          <ClaimButton disabled={true}>
            <ButtonText>Claim</ButtonText>
          </ClaimButton>
        </ClaimButtonWrapper>
      )
    }
    return (
      <ClaimButtonWrapper>
        <ClaimButton onClick={() => onClaimReward()}>
          <ButtonText>Claim</ButtonText>
        </ClaimButton>
      </ClaimButtonWrapper>
    )
  }

  return (
    <Wrapper>
      <TitleInfo>
        <SelectorContainer>
          <Navigation fontSize={'18px'} selected={selected} setSelected={setSelected} />
        </SelectorContainer>
        <YieldTitle>APR: {apr.toFixed(0)}%</YieldTitle>
      </TitleInfo>

      <InputBox
        currency={currency}
        value={amountIn}
        onChange={(value: string) => setAmountIn(value)}
        title={selected === NavigationTypes.STAKE ? `${currency.symbol} balance` : `${currency.symbol} staked`}
        maxValue={selected === NavigationTypes.STAKE ? null : toBN(depositAmount).toString()}
      />

      {getApproveButton()}
      {getActionButton()}

      <Line />
      {Number(depositAmount) > 0 && (
        <BoxWrapper>
          <span>{currency.symbol} Staked:</span>
          <AmountSpan>
            {formatBalance(depositAmount)} {currency?.symbol}
          </AmountSpan>
        </BoxWrapper>
      )}

      <Line />
      {Number(depositAmount) > 0 && (
        <BoxWrapper>
          <span>Total {currency.symbol} Staked:</span>
          <AmountSpan>
            {formatBalance(totalDepositedAmount)} {currency?.symbol}
          </AmountSpan>
        </BoxWrapper>
      )}

      <Line />
      <BoxWrapper>
        <div>
          <span style={{ fontSize: '12px' }}>Reward:</span>
          <RewardData>
            <span>{rewardsAmount && formatBalance(rewardsAmount)}</span>
            <Row style={{ marginLeft: '10px' }}>
              <span>{rewardToken.symbol}</span>
            </Row>
          </RewardData>
        </div>
        <div>{getClaimButton()}</div>
      </BoxWrapper>
    </Wrapper>
  )
}
