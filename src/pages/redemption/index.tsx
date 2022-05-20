import React, { useState, useMemo, useCallback } from 'react'
import styled from 'styled-components'

import { PrimaryButton } from 'components/Button'
import Hero, { HeroSubtext } from 'components/Hero'
import Disclaimer from 'components/Disclaimer'
import InputBox from 'components/App/Vest/InputBox'

import { DEUS_ADDRESS, USDC_ADDRESS, DynamicRedeemer } from 'constants/addresses'
import { SupportedChainId } from 'constants/chains'

import { useSupportedChainId } from 'hooks/useSupportedChainId'
import { useCurrency } from 'hooks/useCurrency'
import useWeb3React from 'hooks/useWeb3'
import { useWalletModalToggle } from 'state/application/hooks'
import useRedemptionCallback from 'hooks/useRedemptionCallback'
import { useRedeemAmounts, useRedeemData } from 'hooks/useRedemptionPage'
import { tryParseAmount } from 'utils/parse'
import useApproveCallback, { ApprovalState } from 'hooks/useApproveCallback'
import { DotFlashing } from 'components/Icons'
import { useCurrencyBalance } from 'state/wallet/hooks'
import { DEI_TOKEN } from 'constants/borrow'

const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  overflow: visible;
  margin: 0 auto;
`

const Wrapper = styled(Container)`
  margin: 0 auto;
  margin-top: 50px;
  width: clamp(250px, 90%, 1200px);

  & > * {
    &:nth-child(1) {
      margin-bottom: 25px;
      display: flex;
      flex-flow: row nowrap;
      width: 100%;
      gap: 15px;
      & > * {
        &:last-child {
          max-width: 300px;
        }
      }
    }
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    margin-top: 20px;
  `}
`

export default function Redemption() {
  const { chainId, account } = useWeb3React()
  const toggleWalletModal = useWalletModalToggle()
  const isSupportedChainId = useSupportedChainId()

  const redeemPaused = false
  const deiCurrency = DEI_TOKEN
  const usdcCurrency = useCurrency(USDC_ADDRESS[SupportedChainId.FANTOM])
  const deusCurrency = useCurrency(DEUS_ADDRESS[SupportedChainId.FANTOM])
  const deiCurrencyBalance = useCurrencyBalance(account ?? undefined, deiCurrency)

  const { amountIn, amountOut1, amountOut2, onUserInput, onUserOutput1, onUserOutput2 } = useRedeemAmounts()
  const result = useRedeemData()
  console.log(result)

  // Amount typed in either fields
  const deiAmount = useMemo(() => {
    return tryParseAmount(amountIn, deiCurrency || undefined)
  }, [amountIn, deiCurrency])

  const insufficientBalance = useMemo(() => {
    if (!deiAmount) return false
    return deiCurrencyBalance?.lessThan(deiAmount)
  }, [deiCurrencyBalance, deiAmount])

  const usdcAmount = useMemo(() => {
    return tryParseAmount(amountOut1, usdcCurrency || undefined)
  }, [amountOut1, usdcCurrency])

  const {
    state: redeemCallbackState,
    callback: redeemCallback,
    error: redeemCallbackError,
  } = useRedemptionCallback(deiCurrency, usdcCurrency, deiAmount, usdcAmount, amountOut2)

  const [awaitingApproveConfirmation, setAwaitingApproveConfirmation] = useState<boolean>(false)
  const spender = useMemo(() => (chainId ? DynamicRedeemer[chainId] : undefined), [chainId])
  const [approvalState, approveCallback] = useApproveCallback(deiCurrency ?? undefined, spender)
  const [showApprove, showApproveLoader] = useMemo(() => {
    const show = deiCurrency && approvalState !== ApprovalState.APPROVED && !!amountIn
    return [show, show && approvalState === ApprovalState.PENDING]
  }, [deiCurrency, approvalState, amountIn])

  const handleApprove = async () => {
    setAwaitingApproveConfirmation(true)
    await approveCallback()
    setAwaitingApproveConfirmation(false)
  }

  const handleRedeem = useCallback(async () => {
    console.log('called handleRedeem')
    console.log(redeemCallbackState, redeemCallback, redeemCallbackError)
    if (!redeemCallback) return

    let error = ''
    try {
      const txHash = await redeemCallback()
      console.log({ txHash })
    } catch (e) {
      if (e instanceof Error) {
        error = e.message
      } else {
        console.error(e)
        error = 'An unknown error occurred.'
      }
    }
  }, [redeemCallbackState, redeemCallback, redeemCallbackError])

  function getApproveButton(): JSX.Element | null {
    if (!isSupportedChainId || !account) {
      return null
    }
    if (awaitingApproveConfirmation) {
      return (
        <PrimaryButton active>
          Awaiting Confirmation <DotFlashing style={{ marginLeft: '10px' }} />
        </PrimaryButton>
      )
    }
    if (showApproveLoader) {
      return (
        <PrimaryButton active>
          Approving <DotFlashing style={{ marginLeft: '10px' }} />
        </PrimaryButton>
      )
    }
    if (showApprove) {
      return <PrimaryButton onClick={handleApprove}>Allow us to spend {deiCurrency?.symbol}</PrimaryButton>
    }
    return null
  }

  function getActionButton(): JSX.Element | null {
    if (!chainId || !account) {
      return <PrimaryButton onClick={toggleWalletModal}>Connect Wallet</PrimaryButton>
    }
    if (showApprove) {
      return null
    }
    if (redeemPaused) {
      return <PrimaryButton disabled>Redeem Paused</PrimaryButton>
    }

    if (insufficientBalance) {
      return <PrimaryButton disabled>Insufficient {deiCurrency?.symbol} Balance</PrimaryButton>
    }

    // if (loading) {
    //   // global DEI data
    //   return (
    //     <PrimaryButton active>
    //       Loading <DotFlashing style={{ marginLeft: '10px' }} />
    //     </PrimaryButton>
    //   )
    // }
    return <PrimaryButton onClick={() => handleRedeem()}>Redeem DEI</PrimaryButton>
  }

  return (
    <Container>
      <Hero>
        <div>Redemption</div>
        <HeroSubtext>redeem your dei</HeroSubtext>
      </Hero>
      <Wrapper>
        <InputBox currency={deiCurrency} value={amountIn} onChange={(value: string) => onUserInput(value)} />
        <InputBox currency={usdcCurrency} value={amountOut1} onChange={(value: string) => onUserOutput1(value)} />
        <InputBox currency={deusCurrency} value={amountOut2} onChange={(value: string) => onUserOutput2(value)} />
        {getApproveButton()}
        {getActionButton()}
      </Wrapper>
      <Disclaimer />
    </Container>
  )
}
