import React, { useState, useMemo, useCallback } from 'react'
import styled from 'styled-components'
import { toast } from 'react-hot-toast'

import { useWalletModalToggle } from 'state/application/hooks'
import { useTransactionAdder } from 'state/transactions/hooks'
import useWeb3React from 'hooks/useWeb3'
import { useSupportedChainId } from 'hooks/useSupportedChainId'
import { useMasterChefV3Contract } from 'hooks/useContract'
import { ApprovalState } from 'hooks/useApproveNftCallback2'
import { useGetApr } from 'hooks/useVDeusStaking'

import { DefaultHandlerError } from 'utils/parseError'
import { formatAmount } from 'utils/numbers'
import { vDeusStakingPools, vDeusStakingType } from 'constants/stakings'
import { DeiBonder } from 'constants/addresses'

import { VDEUS_TOKEN } from 'constants/tokens'
import { Row } from 'components/Row'
import { PrimaryButton } from 'components/Button'
import { DotFlashing } from 'components/Icons'
import InputBox from '../Redemption/InputBox'
import useDebounce from 'hooks/useDebounce'
import { tryParseAmount } from 'utils/parse'
import useApproveCallback from 'hooks/useApproveCallback'
import { useCurrencyBalance } from 'state/wallet/hooks'
import Navigation, { NavigationTypes } from '../Stake/Navigation'

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
  /* width: unset; */
  /* white-space: nowrap; */

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
  height: 2px;
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
  color: #fdb572;
`

export default function Stake({ flag = false }: { flag?: boolean }) {
  const { chainId, account } = useWeb3React()
  const toggleWalletModal = useWalletModalToggle()
  const isSupportedChainId = useSupportedChainId()
  const [awaitingClaimConfirmation, setAwaitingClaimConfirmation] = useState<boolean>(false)

  const [amountIn, setAmountIn] = useState('')
  const debouncedAmountIn = useDebounce(amountIn, 500)

  const vDEUSCurrency = VDEUS_TOKEN
  const vDEUSAmount = useMemo(() => {
    return tryParseAmount(amountIn, vDEUSCurrency || undefined)
  }, [amountIn, vDEUSCurrency])

  const vdeusCurrencyBalance = useCurrencyBalance(account ?? undefined, vDEUSCurrency)

  const insufficientBalance = useMemo(() => {
    if (!vDEUSAmount) return false
    return vdeusCurrencyBalance?.lessThan(vDEUSAmount)
  }, [vdeusCurrencyBalance, vDEUSAmount])

  const [awaitingApproveConfirmation, setAwaitingApproveConfirmation] = useState<boolean>(false)
  const [awaitingRedeemConfirmation, setAwaitingRedeemConfirmation] = useState<boolean>(false)
  // TODO: correct spender
  const spender = useMemo(() => (chainId ? DeiBonder[chainId] : undefined), [chainId])
  const [approvalState, approveCallback] = useApproveCallback(vDEUSCurrency ?? undefined, spender)
  const [showApprove, showApproveLoader] = useMemo(() => {
    const show = vDEUSCurrency && approvalState !== ApprovalState.APPROVED && !!amountIn
    return [show, show && approvalState === ApprovalState.PENDING]
  }, [vDEUSCurrency, approvalState, amountIn])

  const handleApprove = async () => {
    setAwaitingApproveConfirmation(true)
    await approveCallback()
    setAwaitingApproveConfirmation(false)
  }

  const addTransaction = useTransactionAdder()

  const pool = vDeusStakingPools[0]

  const masterChefContract = useMasterChefV3Contract()
  const pid = useMemo(() => pool.pid, [pool])
  // const { depositAmount, rewardsAmount } = useUserInfo(pid, flag)

  const depositAmount = 0.1
  const rewardsAmount = 1.2

  const apr = useGetApr(pid, flag)

  const onClaimReward = useCallback(
    async (pid: number) => {
      if (flag) {
        toast.error(`Claim disabled`)
        return
      }
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
    [masterChefContract, account, isSupportedChainId, rewardsAmount, addTransaction, flag]
  )

  const handleSwap = useCallback(async () => {
    console.log('called handleSwap')
    // console.log(swapCallbackState, swapCallbackError)
    // if (!swapCallback) return
    try {
      setAwaitingRedeemConfirmation(true)
      // const txHash = await swapCallback()
      setAwaitingRedeemConfirmation(false)
      // console.log({ txHash })
    } catch (e) {
      setAwaitingRedeemConfirmation(false)
      if (e instanceof Error) {
      } else {
        console.error(e)
      }
    }
  }, [])

  function getApproveButton(): JSX.Element | null {
    if (!isSupportedChainId || !account) {
      return null
    } else if (awaitingApproveConfirmation) {
      return (
        <DepositButton active>
          Awaiting Confirmation <DotFlashing style={{ marginLeft: '10px' }} />
        </DepositButton>
      )
    } else if (showApproveLoader) {
      return (
        <DepositButton active>
          Approving <DotFlashing style={{ marginLeft: '10px' }} />
        </DepositButton>
      )
    } else if (showApprove) {
      return <DepositButton onClick={handleApprove}>Allow us to spend {vDEUSCurrency?.symbol}</DepositButton>
    }
    return null
  }

  function getActionButton(): JSX.Element | null {
    if (!chainId || !account) {
      return <DepositButton onClick={toggleWalletModal}>Connect Wallet</DepositButton>
    } else if (showApprove) {
      return null
    } else if (insufficientBalance) {
      return <DepositButton disabled>Insufficient {vDEUSCurrency?.symbol} Balance</DepositButton>
    } else if (awaitingRedeemConfirmation) {
      return (
        <DepositButton>
          {selected === NavigationTypes.STAKE ? 'Staking' : 'Unstaking'} <DotFlashing style={{ marginLeft: '10px' }} />
        </DepositButton>
      )
    }
    return (
      <DepositButton onClick={() => handleSwap()}>
        {selected === NavigationTypes.STAKE ? 'Stake' : 'Unstake'} {vDEUSCurrency?.symbol}
      </DepositButton>
    )
  }

  function getClaimButton(pool: vDeusStakingType): JSX.Element | null {
    if (awaitingClaimConfirmation) {
      return (
        <ClaimButtonWrapper>
          <ClaimButton disabled={true}>
            <ButtonText>
              Claim
              <DotFlashing style={{ marginLeft: '10px' }} />
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
        <ClaimButton onClick={() => onClaimReward(pool.pid)}>
          <ButtonText>Claim</ButtonText>
        </ClaimButton>
      </ClaimButtonWrapper>
    )
  }

  const [selected, setSelected] = useState<NavigationTypes>(NavigationTypes.STAKE)

  return (
    <Wrapper>
      <TitleInfo>
        <SelectorContainer>
          <Navigation fontSize={'18px'} selected={selected} setSelected={setSelected} />
        </SelectorContainer>
        <YieldTitle>APR: {apr.toFixed(0)}%</YieldTitle>
      </TitleInfo>

      {selected === NavigationTypes.STAKE ? (
        <InputBox
          currency={vDEUSCurrency}
          value={amountIn}
          onChange={(value: string) => setAmountIn(value)}
          title={'vDEUS'}
        />
      ) : (
        // TODO: pass vDEUS staked currency and value to this component
        <InputBox
          currency={vDEUSCurrency}
          value={amountIn}
          onChange={(value: string) => setAmountIn(value)}
          title={'vDEUS Staked'}
        />
      )}

      {getApproveButton()}
      {getActionButton()}

      <Line />
      {depositAmount > 0 && (
        <BoxWrapper>
          <span>vDEUS Staked:</span>
          <AmountSpan>
            {formatAmount(depositAmount)} {vDEUSCurrency?.symbol}
          </AmountSpan>
        </BoxWrapper>
      )}

      <Line />
      <BoxWrapper>
        <div>
          <span style={{ fontSize: '12px' }}>Reward:</span>
          <RewardData>
            <span>{rewardsAmount && rewardsAmount?.toFixed(3)}</span>
            <Row style={{ marginLeft: '10px' }}>
              <span>{VDEUS_TOKEN.symbol}</span>
            </Row>
          </RewardData>
        </div>
        <div>{getClaimButton(pool)}</div>
      </BoxWrapper>
    </Wrapper>
  )
}
