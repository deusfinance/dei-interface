import React, { useCallback, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import styled from 'styled-components'
import { ZERO } from '@sushiswap/core-sdk'
import BigNumber from 'bignumber.js'

import { useCurrencyBalance } from 'state/wallet/hooks'
import { useWalletModalToggle } from 'state/application/hooks'
import useWeb3React from 'hooks/useWeb3'
import { useSupportedChainId } from 'hooks/useSupportedChainId'
import { useCurrency } from 'hooks/useCurrency'
import useRpcChangerCallback from 'hooks/useRpcChangerCallback'
import { useIsTransactionPending, useTransactionAdder } from 'state/transactions/hooks'
import { useBondsContract } from 'hooks/useContract'
import useApproveCallback, { ApprovalState } from 'hooks/useApproveCallback'

import { USDC_TOKEN } from 'constants/bonds'
import { SupportedChainId } from 'constants/chains'
import { Bonds } from 'constants/addresses'

import { InputBox, BondsInformation } from 'components/App/Bonds'
import Hero, { HeroSubtext } from 'components/Hero'
import { PrimaryButton } from 'components/Button'
import { Card } from 'components/Card'
import { ArrowBubble, DotFlashing } from 'components/Icons'
import Disclaimer from 'components/Disclaimer'

const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  overflow: visible;
  margin: 0 auto;
`

const Wrapper = styled(Container)`
  margin: 0 auto;
  margin-top: 50px;
  width: clamp(250px, 90%, 600px);
  gap: 10px;
`

const ReturnWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  gap: 10px;
  align-items: center;
  justify-content: flex-start;
  overflow: visible;
  font-size: 0.9rem;
  margin-bottom: 20px;

  &:hover {
    cursor: pointer;
  }

  & > * {
    &:first-child {
      transform: rotate(90deg);
    }
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin-bottom: 5px;
  `}
`

const CardWrapper = styled(Card)`
  display: flex;
  flex-flow: column wrap;
  justify-content: center;
  gap: 10px;
  & > * {
    flex: 1;
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-flow: column nowrap;
  `}
`

const ActionButton = styled(PrimaryButton)`
  margin-top: 15px;
`

export default function Buy() {
  const { chainId, account } = useWeb3React()
  const router = useRouter()
  const isSupportedChainId = useSupportedChainId()
  const toggleWalletModal = useWalletModalToggle()
  const rpcChangerCallback = useRpcChangerCallback()
  const [typedValue, setTypedValue] = useState('')
  const [awaitingApproveConfirmation, setAwaitingApproveConfirmation] = useState(false)
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false)
  const [pendingTxHash, setPendingTxHash] = useState('')
  const addTransaction = useTransactionAdder()
  const showTransactionPending = useIsTransactionPending(pendingTxHash)

  const usdcCurrency = useCurrency(USDC_TOKEN.address)
  const usdcBalance = useCurrencyBalance(account ?? undefined, usdcCurrency ?? undefined)
  const bondContract = useBondsContract()
  const spender = useMemo(() => {
    return chainId && Bonds[chainId] ? Bonds[chainId] : undefined
  }, [chainId])

  const [approvalState, approveCallback] = useApproveCallback(usdcCurrency ?? undefined, spender)
  const [showApprove, showApproveLoader] = useMemo(() => {
    const show = usdcCurrency && approvalState !== ApprovalState.APPROVED && !!typedValue
    return [show, show && approvalState === ApprovalState.PENDING]
  }, [usdcCurrency, approvalState, typedValue])

  const INSUFFICIENT_BALANCE = useMemo(() => {
    if (!usdcBalance || usdcBalance.equalTo(ZERO)) return false
    return new BigNumber(usdcBalance.toExact()).isLessThan(typedValue)
  }, [usdcBalance, typedValue])

  const amountBN: BigNumber = useMemo(() => {
    if (!typedValue || typedValue === '0' || !usdcCurrency) return new BigNumber('0')
    return new BigNumber(typedValue).times(new BigNumber(10).pow(usdcCurrency.decimals))
  }, [typedValue, usdcCurrency])

  //TODO: add apy from contract
  const apyBN: BigNumber = useMemo(() => {
    // if (!typedValue || typedValue === '0' || !usdcCurrency) return new BigNumber('0')
    return new BigNumber(35).times(new BigNumber(10).pow(16))
  }, [])

  const onBuyBond = useCallback(async () => {
    try {
      if (amountBN.isEqualTo('0') || !bondContract || INSUFFICIENT_BALANCE) return
      setAwaitingConfirmation(true)
      const response = await bondContract.buyBond(amountBN.toFixed(), apyBN.toFixed())
      addTransaction(response, { summary: `Buy Bond with ${typedValue} USDC`, vest: { hash: response.hash } })
      setPendingTxHash(response.hash)
      setAwaitingConfirmation(false)
    } catch (err) {
      console.error(err)
      setAwaitingConfirmation(false)
      setPendingTxHash('')
    }
  }, [typedValue, amountBN, INSUFFICIENT_BALANCE, bondContract, addTransaction])

  const onReturnClick = useCallback(() => {
    router.push('/bonds')
  }, [router])

  const handleApprove = async () => {
    setAwaitingApproveConfirmation(true)
    await approveCallback()
    setAwaitingApproveConfirmation(false)
  }

  function getActionButton() {
    // approve
    if (awaitingApproveConfirmation) {
      return (
        <ActionButton active>
          Awaiting Confirmation <DotFlashing style={{ marginLeft: '10px' }} />
        </ActionButton>
      )
    }
    if (showApproveLoader) {
      return (
        <ActionButton active>
          Approving <DotFlashing style={{ marginLeft: '10px' }} />
        </ActionButton>
      )
    }
    if (showApprove) {
      return <ActionButton onClick={handleApprove}>Approve</ActionButton>
    }
    if (INSUFFICIENT_BALANCE) {
      return <ActionButton disabled>INSUFFICIENT BALANCE</ActionButton>
    }
    if (awaitingConfirmation) {
      return (
        <ActionButton active>
          Awaiting Confirmation <DotFlashing style={{ marginLeft: '10px' }} />
        </ActionButton>
      )
    }
    if (showTransactionPending) {
      return (
        <ActionButton active>
          Deposit <DotFlashing style={{ marginLeft: '10px' }} />
        </ActionButton>
      )
    }

    return <ActionButton onClick={onBuyBond}>Deposit</ActionButton>
  }

  function getMainContent() {
    if (!chainId || !account) {
      return (
        <>
          <div>Connect your Wallet in order to buy Bonds.</div>
          <PrimaryButton onClick={toggleWalletModal}>Connect Wallet</PrimaryButton>
        </>
      )
    }
    if (!isSupportedChainId) {
      return (
        <>
          <div>You are not connected to the Fantom Opera Network.</div>
          <PrimaryButton onClick={() => rpcChangerCallback(SupportedChainId.FANTOM)}>Switch to Fantom</PrimaryButton>
        </>
      )
    }
    if (!usdcCurrency) {
      return (
        <div>
          Experiencing issues with the Fantom RPC, unable to load this page. If this issue persist, try to refresh the
          page.
        </div>
      )
    }

    return (
      <CardWrapper>
        <InputBox currency={usdcCurrency} value={typedValue} onChange={(value: string) => setTypedValue(value)} />
        {getActionButton()}
        <BondsInformation bondsAPY={'100'} />
      </CardWrapper>
    )
  }

  return (
    <Container>
      <Hero>
        <div>Buy Bond</div>
        <HeroSubtext>.................</HeroSubtext>
      </Hero>
      <Wrapper>
        <ReturnWrapper onClick={onReturnClick}>
          <ArrowBubble size={20} />
          Back to Bonds
        </ReturnWrapper>
        {getMainContent()}
      </Wrapper>
      <Disclaimer />
    </Container>
  )
}
