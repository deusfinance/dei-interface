import React, { useState, useMemo, useCallback } from 'react'
import styled from 'styled-components'
import { darken } from 'polished'
import { ArrowDown } from 'react-feather'

import { useCurrencyBalance } from 'state/wallet/hooks'
import { useWalletModalToggle } from 'state/application/hooks'
import useWeb3React from 'hooks/useWeb3'
import useDebounce from 'hooks/useDebounce'
import { useSupportedChainId } from 'hooks/useSupportedChainId'
import useApproveCallback, { ApprovalState } from 'hooks/useApproveCallback'
import useBondsCallback from 'hooks/useBondsCallback'
import { useBondsAmountsOut, useBonderData } from 'hooks/useBondsPage'
import { tryParseAmount } from 'utils/parse'

import { PrimaryButton } from 'components/Button'
import { Row } from 'components/Row'
import { DotFlashing, Info } from 'components/Icons'

import InputBox from 'components/App/Redemption/InputBox'
import { DeiBonder } from 'constants/addresses'
import { DEI_TOKEN, BDEI_TOKEN } from 'constants/tokens'
import InfoBox from 'components/App/Bonds/InfoBox'
import { ExternalLink } from 'components/Link'

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

const Description = styled.div`
  font-size: 0.85rem;
  line-height: 1.25rem;
  margin-left: 10px;
  color: ${({ theme }) => darken(0.4, theme.text1)};
`

export default function Mint() {
  const { chainId, account } = useWeb3React()
  const toggleWalletModal = useWalletModalToggle()
  const isSupportedChainId = useSupportedChainId()
  const [amountIn, setAmountIn] = useState('')
  const debouncedAmountIn = useDebounce(amountIn, 500)
  const deiCurrency = DEI_TOKEN
  const bDeiCurrency = BDEI_TOKEN
  const deiCurrencyBalance = useCurrencyBalance(account ?? undefined, deiCurrency)

  const { amountOut } = useBondsAmountsOut(debouncedAmountIn)
  const { bondingPaused } = useBonderData()
  // Amount typed in either fields
  const deiAmount = useMemo(() => {
    return tryParseAmount(amountIn, deiCurrency || undefined)
  }, [amountIn, deiCurrency])

  const insufficientBalance = useMemo(() => {
    if (!deiAmount) return false
    return deiCurrencyBalance?.lessThan(deiAmount)
  }, [deiCurrencyBalance, deiAmount])
  const {
    state: redeemCallbackState,
    callback: redeemCallback,
    error: redeemCallbackError,
  } = useBondsCallback(deiCurrency, deiAmount)

  const [awaitingApproveConfirmation, setAwaitingApproveConfirmation] = useState<boolean>(false)
  const [awaitingRedeemConfirmation, setAwaitingRedeemConfirmation] = useState<boolean>(false)
  const spender = useMemo(() => (chainId ? DeiBonder[chainId] : undefined), [chainId])
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

  const handleMint = useCallback(async () => {
    console.log('called handleMint')
    console.log(redeemCallbackState, redeemCallback, redeemCallbackError)
    if (!redeemCallback) return

    // let error = ''
    try {
      setAwaitingRedeemConfirmation(true)
      const txHash = await redeemCallback()
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
  }, [redeemCallbackState, redeemCallback, redeemCallbackError])

  function getApproveButton(): JSX.Element | null {
    return null
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
      return <RedeemButton onClick={handleApprove}>Allow us to spend {deiCurrency?.symbol}</RedeemButton>
    }
    return null
  }

  function getActionButton(): JSX.Element | null {
    return <RedeemButton disabled>Bonding is closed</RedeemButton>

    if (!chainId || !account) {
      return <RedeemButton onClick={toggleWalletModal}>Connect Wallet</RedeemButton>
    }
    if (showApprove) {
      return null
    }

    if (bondingPaused) {
      return <RedeemButton disabled>Mint Paused</RedeemButton>
    }
    if (insufficientBalance) {
      return <RedeemButton disabled>Insufficient {deiCurrency?.symbol} Balance</RedeemButton>
    }

    if (awaitingRedeemConfirmation) {
      return (
        <RedeemButton>
          Minting bDEI <DotFlashing />
        </RedeemButton>
      )
    }

    return <RedeemButton onClick={() => handleMint()}>Mint bDEI</RedeemButton>
  }

  return (
    <>
      <Wrapper>
        <InputBox
          currency={deiCurrency}
          value={amountIn}
          onChange={(value: string) => setAmountIn(value)}
          title={'From'}
        />
        <ArrowDown />

        <InputBox
          currency={bDeiCurrency}
          value={amountOut}
          onChange={(value: string) => console.log(value)}
          title={'To'}
          disabled={true}
        />
        {
          <Row mt={'8px'}>
            <Info data-for="id" data-tip={'Tool tip for hint client'} size={15} />
            <Description>
              DEI Bonds are currently paused, read more about it{' '}
              <ExternalLink
                style={{ textDecoration: 'underline' }}
                href="https://lafayettetabor.medium.com/deiv2-how-to-clear-old-debt-d48002965e1a"
              >
                here
              </ExternalLink>
              {'.'}
            </Description>
          </Row>
        }
        <div style={{ marginTop: '20px' }}></div>
        {getApproveButton()}
        {getActionButton()}
      </Wrapper>
      <InfoBox amountIn={debouncedAmountIn} />
    </>
  )
}
