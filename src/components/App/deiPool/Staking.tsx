import React, { useState, useMemo, useCallback } from 'react'
import styled from 'styled-components'

import { useCurrencyBalance } from 'state/wallet/hooks'
import useWeb3React from 'hooks/useWeb3'
import { useSupportedChainId } from 'hooks/useSupportedChainId'
import useApproveCallback, { ApprovalState } from 'hooks/useApproveCallback'
import { tryParseAmount } from 'utils/parse'

import { MasterChefV2 } from 'constants/addresses'
import StakeBox from 'components/App/deiPool/StakeBox'
import { useGetApy, useStakingData } from 'hooks/useBdeiStakingPage'
import { useMasterChefV2Contract } from 'hooks/useContract'
import Navigation, { NavigationTypes } from 'components/App/Stake/Navigation'
import toast from 'react-hot-toast'
import { DefaultHandlerError } from 'utils/parseError'
import { useTransactionAdder } from 'state/transactions/hooks'
import { RowCenter, RowEnd, RowStart } from 'components/Row'
import { toBN } from 'utils/numbers'
import { Loader } from 'components/Icons'
import { Currency } from '@sushiswap/core-sdk'
import { StakingType } from 'constants/stakings'

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

const SelectorContainer = styled.div`
  display: flex;
  flex-flow: column nowrap;
  overflow: visible;
  margin: 0 auto;
  padding-right: 24px;
  margin-bottom: 12px;
`

export default function Staking({ pool }: { pool: StakingType }) {
  const { chainId, account } = useWeb3React()
  //   const toggleWalletModal = useWalletModalToggle()
  const { token: currency, pid, name } = pool

  const isSupportedChainId = useSupportedChainId()
  const [amountIn, setAmountIn] = useState('')
  const currencyBalance = useCurrencyBalance(account ?? undefined, currency)

  const masterChefContract = useMasterChefV2Contract()

  const addTransaction = useTransactionAdder()
  const [pendingTxHash, setPendingTxHash] = useState('')
  //   const showTransactionPending = useIsTransactionPending(pendingTxHash)

  const { rewardsAmount, depositAmount } = useStakingData(pid)
  const apr = useGetApy() // TODO: use pool id
  const currencyAmount = useMemo(() => {
    return tryParseAmount(amountIn, currency || undefined)
  }, [amountIn, currency])

  const insufficientBalance = useMemo(() => {
    if (!currencyAmount) return false
    return currencyBalance?.lessThan(currencyAmount)
  }, [currencyBalance, currencyAmount])

  const [awaitingApproveConfirmation, setAwaitingApproveConfirmation] = useState<boolean>(false)
  const [awaitingDepositConfirmation, setAwaitingDepositConfirmation] = useState<boolean>(false)
  const [awaitingWithdrawConfirmation, setAwaitingWithdrawConfirmation] = useState<boolean>(false)
  const [awaitingClaimConfirmation, setAwaitClaimConfirmation] = useState<boolean>(false)

  const [selected, setSelected] = useState<NavigationTypes>(NavigationTypes.STAKE)

  const spender = useMemo(() => (chainId ? MasterChefV2[chainId] : undefined), [chainId])
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
        if (!masterChefContract || !account || !isSupportedChainId || !amountIn) return
        setAwaitingWithdrawConfirmation(true)
        const response = await masterChefContract.withdraw(Pid, toBN(amountIn).times(1e18).toFixed(), account)
        addTransaction(response, { summary: `Withdraw ${amountIn}`, vest: { hash: response.hash } })
        setAwaitingWithdrawConfirmation(false)
        // setPendingTxHash(response.hash)
      } catch (err) {
        console.log(err)
        toast.error(DefaultHandlerError(err))
        setAwaitingWithdrawConfirmation(false)
        // setPendingTxHash('')
      }
    },
    [masterChefContract, addTransaction, account, isSupportedChainId, amountIn]
  )

  return (
    <>
      <Wrapper>
        <SelectorContainer>
          <Navigation selected={selected} setSelected={setSelected} />
        </SelectorContainer>

        <RowCenter style={{ alignItems: 'center' }}>
          <LeftTitle>{name}</LeftTitle>
          <RowEnd>
            APR:<Label>{apr ? `${apr.toFixed(3)}%` : <Loader />}</Label>
          </RowEnd>
        </RowCenter>
        <div style={{ marginTop: '20px' }}></div>
        {selected === NavigationTypes.UNSTAKE && (
          <StakeBox
            currency={currency}
            onClick={() => onWithdraw(pid)}
            onChange={(value: string) => setAmountIn(value)}
            type={awaitingWithdrawConfirmation ? 'Unstaking...' : 'Unstake'}
            value={amountIn}
            title={`${currency.name} Staked`}
            maxValue={depositAmount.toString()}
          />
        )}
        {selected === NavigationTypes.STAKE && (
          <StakeBox
            currency={currency}
            onClick={showApprove ? handleApprove : () => onDeposit(pid)}
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
            title={'LP Balance:'}
          />
        )}
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
