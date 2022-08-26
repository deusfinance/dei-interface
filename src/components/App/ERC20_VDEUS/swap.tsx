import React, { useState, useMemo, useCallback } from 'react'
import styled from 'styled-components'
import { ArrowDown } from 'react-feather'

import { useCurrencyBalance } from 'state/wallet/hooks'
import { useWalletModalToggle } from 'state/application/hooks'
import useWeb3React from 'hooks/useWeb3'
import useDebounce from 'hooks/useDebounce'
import { useSupportedChainId } from 'hooks/useSupportedChainId'
import useApproveCallback, { ApprovalState } from 'hooks/useApproveCallback'
import useSwapCallback from 'hooks/useSwapCallback_VDEUS'
import { useSwapAmountsOut } from 'hooks/useSwapPage_VDEUS'
import { tryParseAmount } from 'utils/parse'

import AdvancedOptions from 'components/App/Swap/AdvancedOptions'
import InputBox from 'components/App/Redemption/InputBox'
import { PrimaryButton } from 'components/Button'
import { DotFlashing } from 'components/Icons'
import { DV_Pool } from 'constants/addresses'
import { DEUS_TOKEN, VDEUS_TOKEN } from 'constants/tokens'

const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  overflow: visible;
  margin: 0 auto;
`

const Wrapper = styled(Container)`
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
    &:nth-child(6) {
      margin-top: 20px !important;
      padding: 0;
    }
  }
`

const RedeemButton = styled(PrimaryButton)`
  border-radius: 12px;
`

export default function SwapPage() {
  const { chainId, account } = useWeb3React()
  const toggleWalletModal = useWalletModalToggle()
  const isSupportedChainId = useSupportedChainId()
  const [amountIn, setAmountIn] = useState('')
  const [slippage, setSlippage] = useState(0.5)
  const debouncedAmountIn = useDebounce(amountIn, 500)
  const [inputCurrency, setInputCurrency] = useState(DEUS_TOKEN)
  const [outputCurrency, setOutputCurrency] = useState(VDEUS_TOKEN)

  const inputBalance = useCurrencyBalance(account ?? undefined, inputCurrency)
  const { amountOut } = useSwapAmountsOut(debouncedAmountIn, outputCurrency)

  // Amount typed in either fields
  const inputAmount = useMemo(() => {
    return tryParseAmount(amountIn, inputCurrency || undefined)
  }, [amountIn, inputCurrency])

  const outputAmount = useMemo(() => {
    return tryParseAmount(amountOut, outputCurrency || undefined)
  }, [amountOut, outputCurrency])

  const insufficientBalance = useMemo(() => {
    if (!inputAmount) return false
    return inputBalance?.lessThan(inputAmount)
  }, [inputBalance, inputAmount])

  const {
    state: swapCallbackState,
    callback: swapCallback,
    error: swapCallbackError,
  } = useSwapCallback(inputCurrency, outputCurrency, inputAmount, outputAmount, slippage, 20)

  const [awaitingApproveConfirmation, setAwaitingApproveConfirmation] = useState<boolean>(false)
  const [awaitingRedeemConfirmation, setAwaitingRedeemConfirmation] = useState<boolean>(false)
  const spender = useMemo(() => (chainId ? DV_Pool[chainId] : undefined), [chainId])
  const [approvalState, approveCallback] = useApproveCallback(inputCurrency ?? undefined, spender)
  const [showApprove, showApproveLoader] = useMemo(() => {
    const show = inputCurrency && approvalState !== ApprovalState.APPROVED && !!amountIn
    return [show, show && approvalState === ApprovalState.PENDING]
  }, [inputCurrency, approvalState, amountIn])

  const handleApprove = async () => {
    setAwaitingApproveConfirmation(true)
    await approveCallback()
    setAwaitingApproveConfirmation(false)
  }

  const handleSwap = useCallback(async () => {
    console.log('called handleSwap')
    console.log(swapCallbackState, swapCallbackError)
    if (!swapCallback) return
    try {
      setAwaitingRedeemConfirmation(true)
      const txHash = await swapCallback()
      setAwaitingRedeemConfirmation(false)
      console.log({ txHash })
    } catch (e) {
      setAwaitingRedeemConfirmation(false)
      if (e instanceof Error) {
      } else {
        console.error(e)
      }
    }
  }, [swapCallbackState, swapCallback, swapCallbackError])

  function getApproveButton(): JSX.Element | null {
    if (!isSupportedChainId || !account) {
      return null
    } else if (awaitingApproveConfirmation) {
      return (
        <RedeemButton active>
          Awaiting Confirmation <DotFlashing style={{ marginLeft: '10px' }} />
        </RedeemButton>
      )
    } else if (showApproveLoader) {
      return (
        <RedeemButton active>
          Approving <DotFlashing style={{ marginLeft: '10px' }} />
        </RedeemButton>
      )
    } else if (showApprove) {
      return <RedeemButton onClick={handleApprove}>Allow us to spend {inputCurrency?.symbol}</RedeemButton>
    }
    return null
  }

  function getActionButton(): JSX.Element | null {
    if (!chainId || !account) {
      return <RedeemButton onClick={toggleWalletModal}>Connect Wallet</RedeemButton>
    } else if (showApprove) {
      return null
    } else if (insufficientBalance) {
      return <RedeemButton disabled>Insufficient {inputCurrency?.symbol} Balance</RedeemButton>
    } else if (awaitingRedeemConfirmation) {
      return (
        <RedeemButton>
          Swapping <DotFlashing style={{ marginLeft: '10px' }} />
        </RedeemButton>
      )
    }
    return <RedeemButton onClick={() => handleSwap()}>Swap</RedeemButton>
  }

  return (
    <>
      <Wrapper>
        <InputBox
          currency={inputCurrency}
          value={amountIn}
          onChange={(value: string) => setAmountIn(value)}
          title={'From'}
          disable_vdeus
        />
        <ArrowDown
          style={{ cursor: 'pointer' }}
          onClick={() => {
            setInputCurrency(outputCurrency)
            setOutputCurrency(inputCurrency)
          }}
        />

        <InputBox
          currency={outputCurrency}
          value={amountOut}
          onChange={(value: string) => console.log(value)}
          title={'To'}
          disabled={true}
          disable_vdeus
        />
        <div style={{ marginTop: '20px' }}></div>
        {getApproveButton()}
        {getActionButton()}
        <AdvancedOptions slippage={slippage} setSlippage={setSlippage} />
      </Wrapper>
    </>
  )
}
