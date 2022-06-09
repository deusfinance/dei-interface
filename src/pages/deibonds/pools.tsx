import React, { useState, useMemo, useCallback } from 'react'
import styled from 'styled-components'

import { useCurrencyBalance } from 'state/wallet/hooks'
import { useWalletModalToggle } from 'state/application/hooks'
import useWeb3React from 'hooks/useWeb3'
import { useSupportedChainId } from 'hooks/useSupportedChainId'
import useApproveCallback, { ApprovalState } from 'hooks/useApproveCallback'
import { tryParseAmount } from 'utils/parse'

import { PrimaryButton } from 'components/Button'
import Hero from 'components/Hero'
import Disclaimer from 'components/Disclaimer'
import { DEI_TOKEN, BDEI_TOKEN } from 'constants/tokens'
import { MasterChefV2 } from 'constants/addresses'
import StakeBox from 'components/App/deiPool/StakeBox'
import { useGetApy, useStakingData } from 'hooks/useBdeiStakingPage'
import { useMasterChefV2Contract } from 'hooks/useContract'
import toast from 'react-hot-toast'
import { DefaultHandlerError } from 'utils/parseError'
import { useIsTransactionPending, useTransactionAdder } from 'state/transactions/hooks'
import { RowCenter, RowEnd, RowStart } from 'components/Row'
import { toBN } from 'utils/numbers'
import Navigation, { NavigationTypes } from 'components/App/Stake/Navigation'
import { Loader } from 'components/Icons'
import { StablePools } from 'constants/sPools'

const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  overflow: visible;
  margin: 0 auto;
`

const Wrapper = styled(Container)`
  margin: 0 auto;
  margin-top: 25px;
  width: clamp(250px, 90%, 550px);
  background-color: rgb(13 13 13);
  padding: 20px 15px;
  border: 1px solid rgb(0, 0, 0);
  border-radius: 15px;
  /* justify-content: center; */
  /* & > * {
    &:nth-child(2) {
      margin: 15px auto;
    }
  } */
`

const SelectorContainer = styled.div`
  display: flex;
  flex-flow: column nowrap;
  overflow: visible;
  margin: 0 auto;
  margin-top: 24px;
  padding-right: 24px;
`

const TopWrapper = styled.div`
  display: inline-flex;
  flex-direction: row;
  flex-wrap: wrap;
`

const RightWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 50%;
`

const ToggleState = styled.div`
  display: flex;
  justify-content: space-between;
  background-color: rgb(13 13 13);
  border: 1px solid rgb(0, 0, 0);
  border-radius: 15px;
  margin: 50px 25px -45px 25px;
`

const StateButton = styled.div`
  width: 50%;
  text-align: center;
  padding: 12px;
  cursor: pointer;
`

const DepositButton = styled(PrimaryButton)`
  border-radius: 15px;
`

const LeftTitle = styled(RowStart)`
  font-size: 24px;
  font-weight: 500;
  padding-bottom: -1px;
`

const Label = styled.div`
  color: ${({ theme }) => theme.yellow3};
  margin-left: 5px;
  font-size: 1.2rem;
`

export default function Pools() {
  const { chainId, account } = useWeb3React()
  const toggleWalletModal = useWalletModalToggle()
  const isSupportedChainId = useSupportedChainId()
  const [amountIn, setAmountIn] = useState('')
  const [amountIn2, setAmountIn2] = useState('')
  const [amountIn3, setAmountIn3] = useState('')
  const deiCurrency = DEI_TOKEN
  const bdeiCurrency = BDEI_TOKEN
  const pool = StablePools[0]
  const lpCurrency = pool.lpToken
  const deiCurrencyBalance = useCurrencyBalance(account ?? undefined, deiCurrency)
  const bdeiCurrencyBalance = useCurrencyBalance(account ?? undefined, bdeiCurrency)
  const lpCurrencyBalance = useCurrencyBalance(account ?? undefined, lpCurrency)

  const masterChefContract = useMasterChefV2Contract()

  const addTransaction = useTransactionAdder()
  const [pendingTxHash, setPendingTxHash] = useState('')
  const showTransactionPending = useIsTransactionPending(pendingTxHash)

  const { rewardsAmount, depositAmount } = useStakingData(0)
  const apy = useGetApy()
  const apy2 = parseFloat('0.0')
  const deiAmount = useMemo(() => {
    return tryParseAmount(amountIn, deiCurrency || undefined)
  }, [amountIn, deiCurrency])

  const bdeiAmount = useMemo(() => {
    return tryParseAmount(amountIn2, bdeiCurrency || undefined)
  }, [amountIn2, bdeiCurrency])

  const lpAmount = useMemo(() => {
    return tryParseAmount(amountIn3, lpCurrency || undefined)
  }, [amountIn3, lpCurrency])

  const insufficientBalance = useMemo(() => {
    if (!deiAmount || !bdeiAmount) return false
    return deiCurrencyBalance?.lessThan(deiAmount) && bdeiCurrencyBalance?.lessThan(bdeiAmount)
  }, [deiCurrencyBalance, bdeiCurrencyBalance, deiAmount, bdeiAmount])

  const [awaitingApproveConfirmation, setAwaitingApproveConfirmation] = useState<boolean>(false)
  const [awaitingDepositConfirmation, setAwaitingDepositConfirmation] = useState<boolean>(false)
  const [awaitingWithdrawConfirmation, setAwaitingWithdrawConfirmation] = useState<boolean>(false)
  const [awaitingClaimConfirmation, setAwaitClaimConfirmation] = useState<boolean>(false)

  const spender = useMemo(() => (chainId ? MasterChefV2[chainId] : undefined), [chainId])
  const [approvalState, approveCallback] = useApproveCallback(bdeiCurrency ?? undefined, spender)
  const [approvalState2, approveCallback2] = useApproveCallback(lpCurrency ?? undefined, spender)

  const [showApprove, showApproveLoader] = useMemo(() => {
    const show = bdeiCurrency && approvalState !== ApprovalState.APPROVED
    return [show, show && approvalState === ApprovalState.PENDING]
  }, [bdeiCurrency, approvalState])

  const [showApprove2, showApproveLoader2] = useMemo(() => {
    const show = lpCurrency && approvalState2 !== ApprovalState.APPROVED
    return [show, show && approvalState2 === ApprovalState.PENDING]
  }, [lpCurrency, approvalState2])

  const handleApprove = async () => {
    setAwaitingApproveConfirmation(true)
    await approveCallback()
    setAwaitingApproveConfirmation(false)
  }

  const handleApprove2 = async () => {
    setAwaitingApproveConfirmation(true)
    await approveCallback2()
    setAwaitingApproveConfirmation(false)
  }

  const onClaimReward = useCallback(async () => {
    try {
      if (!masterChefContract || !account || !isSupportedChainId) return
      setAwaitClaimConfirmation(true)
      const response = await masterChefContract.harvest(0, account)
      addTransaction(response, { summary: `Claim Rewards`, vest: { hash: response.hash } })
      setAwaitClaimConfirmation(false)
      // setPendingTxHash(response.hash)
    } catch (err) {
      console.log(err)
      toast.error(DefaultHandlerError(err))
      setAwaitClaimConfirmation(false)
      // setPendingTxHash('')
    }
  }, [masterChefContract, addTransaction, account, isSupportedChainId])

  const onDeposit = useCallback(
    async (Pid: number) => {
      try {
        if (!masterChefContract || !account || !isSupportedChainId || !amountIn) return
        setAwaitingDepositConfirmation(true)
        const response = await masterChefContract.deposit(Pid, toBN(amountIn).times(1e18).toFixed(), account)
        addTransaction(response, { summary: `Deposit`, vest: { hash: response.hash } })
        setAwaitingDepositConfirmation(false)
        // setPendingTxHash(response.hash)
      } catch (err) {
        console.log(err)
        toast.error(DefaultHandlerError(err))
        setAwaitingDepositConfirmation(false)
        // setPendingTxHash('')
      }
    },
    [masterChefContract, addTransaction, account, isSupportedChainId, amountIn]
  )

  const onWithdraw = useCallback(
    async (Pid: number) => {
      try {
        if (!masterChefContract || !account || !isSupportedChainId || !amountIn2) return
        setAwaitingWithdrawConfirmation(true)
        const response = await masterChefContract.withdraw(Pid, toBN(amountIn2).times(1e18).toFixed(), account)
        addTransaction(response, { summary: `Withdraw ${amountIn2}`, vest: { hash: response.hash } })
        setAwaitingWithdrawConfirmation(false)
        // setPendingTxHash(response.hash)
      } catch (err) {
        console.log(err)
        toast.error(DefaultHandlerError(err))
        setAwaitingWithdrawConfirmation(false)
        // setPendingTxHash('')
      }
    },
    [masterChefContract, addTransaction, account, isSupportedChainId, amountIn2]
  )

  /*   function getApproveButton(): JSX.Element | null {
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

  function getActionButton(): JSX.Element | null {
    if (!chainId || !account) {
      return <DepositButton onClick={toggleWalletModal}>Connect Wallet</DepositButton>
    }
    if (showApprove) {
      return null
    }

    if (insufficientBalance) {
      return <DepositButton disabled>Insufficient {deiCurrency?.symbol} Balance</DepositButton>
    }
    if (awaitingRedeemConfirmation) {
      return (
        <DepositButton>
          Depositing DEI/bDEI <DotFlashing style={{ marginLeft: '10px' }} />
        </DepositButton>
      )
    }

    return <DepositButton onClick={() => handleDeposit()}>Deposit</DepositButton>
  } */

  const [selected, setSelected] = useState<NavigationTypes>(NavigationTypes.STAKE)

  // const getAppComponent = (): JSX.Element => {
  //   if (selected == ActionTypes.ADD) {
  //     return <Add onSwitch={setSelected} />
  //   }
  //   if (selected == ActionTypes.REMOVE) {
  //     return <Remove onSwitch={setSelected} />
  //   }
  //   return <Add onSwitch={setSelected} />
  // }

  const getAppComponent = (): JSX.Element => {
    if (selected == NavigationTypes.STAKE) {
      return (
        <>
          <Wrapper>
            <RowCenter style={{ alignItems: 'center' }}>
              <LeftTitle>bDEI</LeftTitle>
              <RowEnd>
                APR:<Label>{apy ? `${apy.toFixed(3)}%` : <Loader />}</Label>
              </RowEnd>
            </RowCenter>
            <div style={{ marginTop: '20px' }}></div>
            <StakeBox
              currency={bdeiCurrency}
              onClick={showApprove ? handleApprove : () => onDeposit(0)}
              onChange={(value: string) => setAmountIn(value)}
              type={
                showApprove
                  ? awaitingApproveConfirmation
                    ? 'Approving...'
                    : 'Approve'
                  : awaitingDepositConfirmation
                  ? 'Staking...'
                  : 'Stake'
              }
              value={amountIn}
              title={'bDEI Balance:'}
            />
            <div style={{ marginTop: '20px' }}></div>
            <StakeBox
              currency={null}
              onClick={onClaimReward}
              onChange={(value: string) => console.log(value)}
              type={awaitingClaimConfirmation ? 'claiming' : 'claim'}
              value={`${rewardsAmount.toFixed(3)} DEUS`}
              title={'Rewards'}
            />
          </Wrapper>

          <Wrapper>
            <RowCenter style={{ alignItems: 'center' }}>
              <LeftTitle>DEI-bDEI</LeftTitle>
              <RowEnd>
                APR:<Label>{apy2 ? `${apy2.toFixed(3)}%` : <Loader />}</Label>
              </RowEnd>
            </RowCenter>
            <div style={{ marginTop: '20px' }}></div>
            <StakeBox
              currency={lpCurrency}
              onClick={showApprove2 ? handleApprove2 : () => onDeposit(1)}
              onChange={(value: string) => setAmountIn3(value)}
              type={
                showApprove2
                  ? awaitingApproveConfirmation
                    ? 'Approving...'
                    : 'Approve'
                  : awaitingDepositConfirmation
                  ? 'Staking...'
                  : 'Stake'
              }
              value={amountIn3}
              title={'LP Balance:'}
            />
            <div style={{ marginTop: '20px' }}></div>
            <StakeBox
              currency={null}
              onClick={onClaimReward}
              onChange={(value: string) => console.log(value)}
              type={awaitingClaimConfirmation ? 'claiming' : 'claim'}
              value={`${rewardsAmount.toFixed(3)} DEUS`}
              title={'Rewards'}
            />
          </Wrapper>
        </>
      )
    } else {
      return (
        <>
          <Wrapper>
            <RowCenter style={{ alignItems: 'center' }}>
              <LeftTitle>bDEI</LeftTitle>
              <RowEnd>
                APR:<Label>{apy ? `${apy.toFixed(3)}%` : <Loader />}</Label>
              </RowEnd>
            </RowCenter>
            <div style={{ marginTop: '20px' }}></div>
            <StakeBox
              currency={bdeiCurrency}
              onClick={() => onWithdraw(0)}
              onChange={(value: string) => setAmountIn2(value)}
              type={awaitingWithdrawConfirmation ? 'Unstaking...' : 'Unstake'}
              value={amountIn2}
              title={'bDEI Staked'}
              maxValue={depositAmount.toString()}
            />
            <div style={{ marginTop: '20px' }}></div>
            <StakeBox
              currency={null}
              onClick={onClaimReward}
              onChange={(value: string) => console.log(value)}
              type={awaitingClaimConfirmation ? 'claiming' : 'claim'}
              value={`${rewardsAmount.toFixed(3)} DEUS`}
              title={'Rewards'}
            />
          </Wrapper>
          <Wrapper>
            <RowCenter style={{ alignItems: 'center' }}>
              <LeftTitle>DEI-bDEI</LeftTitle>
              <RowEnd>
                APR:<Label>{apy2 ? `${apy2.toFixed(3)}%` : <Loader />}</Label>
              </RowEnd>
            </RowCenter>
            <div style={{ marginTop: '20px' }}></div>
            <StakeBox
              currency={lpCurrency}
              onClick={() => onWithdraw(1)}
              onChange={(value: string) => setAmountIn3(value)}
              type={awaitingWithdrawConfirmation ? 'Unstaking...' : 'Unstake'}
              value={amountIn3}
              title={'LP Staked'}
              // maxValue={depositAmount.toString()}
            />
            <div style={{ marginTop: '20px' }}></div>
            <StakeBox
              currency={null}
              onClick={onClaimReward}
              onChange={(value: string) => console.log(value)}
              type={awaitingClaimConfirmation ? 'claiming' : 'claim'}
              value={`${rewardsAmount.toFixed(3)} DEUS`}
              title={'Rewards'}
            />
          </Wrapper>
        </>
      )
    }
  }

  return (
    <Container>
      <Hero>
        <div>Pools</div>
      </Hero>
      <SelectorContainer>
        <Navigation selected={selected} setSelected={setSelected} />
      </SelectorContainer>

      {getAppComponent()}
      <Disclaimer />
    </Container>
  )
}
