import React, { useState, useMemo, useCallback } from 'react'
import styled from 'styled-components'

import { useCurrencyBalance } from 'state/wallet/hooks'
import { useWalletModalToggle } from 'state/application/hooks'
import useWeb3React from 'hooks/useWeb3'
import useDebounce from 'hooks/useDebounce'
import { useSupportedChainId } from 'hooks/useSupportedChainId'
import useApproveCallback, { ApprovalState } from 'hooks/useApproveCallback'
import useSwapCallback from 'hooks/useSwapCallback'
import { useSwapAmountsOut } from 'hooks/useSwapPage'
import { tryParseAmount } from 'utils/parse'

import Hero from 'components/Hero'
import AdvancedOptions from 'components/App/Swap/AdvancedOptions'
import InputBox from 'components/App/Redemption/InputBox'
import { PrimaryButton } from 'components/Button'
import { DotFlashing, Swap } from 'components/Icons'
import { StablePool_DEI_bDEI } from 'constants/addresses'
import { BDEI_TOKEN, DEI_TOKEN } from 'constants/tokens'
import { StablePools } from 'constants/sPools'
import { Token } from '@sushiswap/core-sdk'

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
  padding: 20px 15px;
  border: 1px solid rgb(0, 0, 0);
  border-radius: 15px;
  justify-content: center;
  & > * {
    &:nth-child(2) {
      margin: 15px auto;
    }
  }
`

const RedeemButton = styled(PrimaryButton)`
  border-radius: 15px;
`

const AdvancedOptionsWrap = styled.div`
  & > * {
    margin-top: 20px !important;
    padding: 0;
  }
`

export default function SwapPage() {
  const { chainId, account } = useWeb3React()
  const toggleWalletModal = useWalletModalToggle()
  const isSupportedChainId = useSupportedChainId()
  const [slippage, setSlippage] = useState(0.5)
  const [amountIn, setAmountIn] = useState('')
  const debouncedAmountIn = useDebounce(amountIn, 500)

  const [currencyFrom, setCurrencyFrom] = useState<Token>(DEI_TOKEN)
  const [currencyTo, setCurrencyTo] = useState<Token>(BDEI_TOKEN)

  const currencyFromBalance = useCurrencyBalance(account ?? undefined, currencyFrom)

  const pool = StablePools[0]
  const { amountOut } = useSwapAmountsOut(debouncedAmountIn, currencyFrom, currencyTo, pool)

  const currencyFromAmount = useMemo(() => {
    return tryParseAmount(amountIn, currencyFrom || undefined)
  }, [amountIn, currencyFrom])

  const currencyToAmount = useMemo(() => {
    return tryParseAmount(amountOut, currencyTo || undefined)
  }, [amountOut, currencyTo])

  const insufficientBalance = useMemo(() => {
    if (!currencyFromAmount) return false
    return currencyFromBalance?.lessThan(currencyFromAmount)
  }, [currencyFromBalance, currencyFromAmount])

  const {
    state: swapCallbackState,
    callback: swapCallback,
    error: swapCallbackError,
  } = useSwapCallback(currencyFrom, currencyTo, currencyFromAmount, currencyToAmount, pool, slippage, 20)

  const [awaitingApproveConfirmation, setAwaitingApproveConfirmation] = useState(false)
  const [awaitingRedeemConfirmation, setAwaitingRedeemConfirmation] = useState(false)
  const spender = useMemo(() => (chainId ? StablePool_DEI_bDEI[chainId] : undefined), [chainId])
  const [approvalState, approveCallback] = useApproveCallback(currencyFrom ?? undefined, spender)
  const [showApprove, showApproveLoader] = useMemo(() => {
    const show = currencyFrom && approvalState !== ApprovalState.APPROVED && !!amountIn
    return [show, show && approvalState === ApprovalState.PENDING]
  }, [currencyFrom, approvalState, amountIn])

  const handleApprove = async () => {
    setAwaitingApproveConfirmation(true)
    await approveCallback()
    setAwaitingApproveConfirmation(false)
  }

  const handleSwap = useCallback(async () => {
    console.log('called handleSwap')
    console.log(swapCallbackState, swapCallback, swapCallbackError)
    if (!swapCallback) return

    try {
      setAwaitingRedeemConfirmation(true)
      const txHash = await swapCallback()
      setAwaitingRedeemConfirmation(false)
      console.log({ txHash })
    } catch (e) {
      setAwaitingRedeemConfirmation(false)
      if (e instanceof Error) {
        // error = e.message
      } else {
        console.error(e)
        // error = 'An unknown error occurred.'
      }
    }
  }, [swapCallbackState, swapCallback, swapCallbackError])

  function getApproveButton(): JSX.Element | null {
    if (!isSupportedChainId || !account) {
      return null
    }
    if (awaitingApproveConfirmation) {
      return (
        <RedeemButton active>
          Awaiting Confirmation <DotFlashing />
        </RedeemButton>
      )
    }
    if (showApproveLoader) {
      return (
        <RedeemButton active>
          Approving <DotFlashing />
        </RedeemButton>
      )
    }
    if (showApprove) {
      return <RedeemButton onClick={handleApprove}>Allow us to spend {currencyFrom?.symbol}</RedeemButton>
    }
    return null
  }

  function getActionButton(): JSX.Element | null {
    if (!chainId || !account) {
      return <RedeemButton onClick={toggleWalletModal}>Connect Wallet</RedeemButton>
    }
    if (showApprove) {
      return null
    }
    if (insufficientBalance) {
      return <RedeemButton disabled>Insufficient {currencyFrom?.symbol} Balance</RedeemButton>
    }
    if (awaitingRedeemConfirmation) {
      return (
        <RedeemButton>
          Swapping <DotFlashing />
        </RedeemButton>
      )
    }

    return <RedeemButton onClick={() => handleSwap()}>Swap</RedeemButton>
  }

  function handleClick() {
    const currency = currencyFrom
    setCurrencyFrom(currencyTo)
    setCurrencyTo(currency)
  }

  return (
    <Container>
      <Hero>
        <div>Swap</div>
      </Hero>
      <Wrapper>
        <InputBox
          currency={currencyFrom}
          value={amountIn}
          onChange={(value: string) => setAmountIn(value)}
          title={'From'}
        />
        <Swap onClick={handleClick} style={{ cursor: 'pointer' }} />

        <InputBox
          currency={currencyTo}
          value={amountOut}
          onChange={(value: string) => console.log(value)}
          title={'To'}
          disabled={true}
        />
        <div style={{ marginTop: '20px' }}></div>
        {getApproveButton()}
        {getActionButton()}
        <AdvancedOptionsWrap>
          <AdvancedOptions slippage={slippage} setSlippage={setSlippage} />
        </AdvancedOptionsWrap>
      </Wrapper>
    </Container>
  )
}
