import React, { useState, useMemo, useCallback } from 'react'
import styled from 'styled-components'
import { darken } from 'polished'
import { ArrowDown, Plus } from 'react-feather'
import Image from 'next/image'

import { useCurrencyBalance } from 'state/wallet/hooks'
import { useWalletModalToggle } from 'state/application/hooks'
import useWeb3React from 'hooks/useWeb3'
import useDebounce from 'hooks/useDebounce'
import { useSupportedChainId } from 'hooks/useSupportedChainId'
import useApproveCallback, { ApprovalState } from 'hooks/useApproveCallback'
import useRedemptionCallback from 'hooks/useRedemptionCallback'
import { useRedeemAmountsOut, useRedeemData } from 'hooks/useRedemptionPage'
import { tryParseAmount } from 'utils/parse'
import { getRemainingTime } from 'utils/time'

import { PrimaryButton } from 'components/Button'
import { DotFlashing, Info } from 'components/Icons'
import { Row, RowEnd } from 'components/Row'
import Hero, { HeroSubtext } from 'components/Hero'
import Disclaimer from 'components/Disclaimer'
import InputBox from 'components/App/Redemption/InputBox'
import RedemptionInfoBox from 'components/App/Redemption/RedemptionInfoBox'
import { B_DEI_TOKEN, DEI_TOKEN } from 'constants/tokens'
import { DynamicRedeemer } from 'constants/addresses'
import { ExternalLink } from 'components/Link'
import NFT_IMG from '/public/static/images/pages/bonds/TR-NFT.svg'

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

const Description = styled.div`
  font-size: 0.85rem;
  line-height: 1.25rem;
  margin-left: 10px;
  color: ${({ theme }) => darken(0.4, theme.text1)};
`

const NftText = styled.div`
  white-space: nowrap;
  position: absolute;
  margin-left: 15px;
  left: 0;
  z-index: 10;
`

const PlusIcon = styled(Plus)`
  margin: -14px auto;
  z-index: 1000;
  padding: 3px;
  border: 1px solid black;
  border-radius: 15px;
  background-color: rgb(0 0 0);
`

const RedeemButton = styled(PrimaryButton)`
  border-radius: 15px;
`

export default function Redemption() {
  const { chainId, account } = useWeb3React()
  const toggleWalletModal = useWalletModalToggle()
  const isSupportedChainId = useSupportedChainId()
  const [amountIn, setAmountIn] = useState('')
  const debouncedAmountIn = useDebounce(amountIn, 500)
  const deiCurrency = DEI_TOKEN
  const bDeiCurrency = B_DEI_TOKEN
  const deiCurrencyBalance = useCurrencyBalance(account ?? undefined, deiCurrency)

  /* const { amountIn, amountOut1, amountOut2, onUserInput, onUserOutput1, onUserOutput2 } = useRedeemAmounts() */
  const { amountOut1, amountOut2 } = useRedeemAmountsOut(debouncedAmountIn, deiCurrency)
  const { redeemPaused, redeemTranche } = useRedeemData()
  // console.log({ redeemPaused, rest })

  // Amount typed in either fields
  const deiAmount = useMemo(() => {
    return tryParseAmount(amountIn, deiCurrency || undefined)
  }, [amountIn, deiCurrency])

  const insufficientBalance = useMemo(() => {
    if (!deiAmount) return false
    return deiCurrencyBalance?.lessThan(deiAmount)
  }, [deiCurrencyBalance, deiAmount])

  const bdeiAmount = deiAmount

  const {
    state: redeemCallbackState,
    callback: redeemCallback,
    error: redeemCallbackError,
  } = useRedemptionCallback(deiCurrency, bDeiCurrency, deiAmount, bdeiAmount)

  const [awaitingApproveConfirmation, setAwaitingApproveConfirmation] = useState<boolean>(false)
  const [awaitingRedeemConfirmation, setAwaitingRedeemConfirmation] = useState<boolean>(false)
  const spender = useMemo(() => (chainId ? DynamicRedeemer[chainId] : undefined), [chainId])
  const [approvalState, approveCallback] = useApproveCallback(deiCurrency ?? undefined, spender)
  const [showApprove, showApproveLoader] = useMemo(() => {
    const show = deiCurrency && approvalState !== ApprovalState.APPROVED && !!amountIn
    return [show, show && approvalState === ApprovalState.PENDING]
  }, [deiCurrency, approvalState, amountIn])

  const { diff } = getRemainingTime(redeemTranche.endTime)

  const handleApprove = async () => {
    setAwaitingApproveConfirmation(true)
    await approveCallback()
    setAwaitingApproveConfirmation(false)
  }

  const handleRedeem = useCallback(async () => {
    console.log('called handleRedeem')
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
    if (!isSupportedChainId || !account) {
      return null
    }
    if (awaitingApproveConfirmation) {
      return (
        <RedeemButton active>
          Awaiting Confirmation <DotFlashing style={{ marginLeft: '10px' }} />
        </RedeemButton>
      )
    }
    if (showApproveLoader) {
      return (
        <RedeemButton active>
          Approving <DotFlashing style={{ marginLeft: '10px' }} />
        </RedeemButton>
      )
    }
    if (showApprove) {
      return <RedeemButton onClick={handleApprove}>Allow us to spend {deiCurrency?.symbol}</RedeemButton>
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
    if (redeemPaused) {
      return <RedeemButton disabled>Redeem Paused</RedeemButton>
    }

    if (Number(amountOut1) > redeemTranche.amountRemaining) {
      return <RedeemButton disabled>Exceeds Available Amount</RedeemButton>
    }

    if (insufficientBalance) {
      return <RedeemButton disabled>Insufficient {deiCurrency?.symbol} Balance</RedeemButton>
    }
    if (awaitingRedeemConfirmation) {
      return (
        <RedeemButton>
          Awaiting Confirmation <DotFlashing style={{ marginLeft: '10px' }} />
        </RedeemButton>
      )
    }

    return <RedeemButton onClick={() => handleRedeem()}>Buy Bonds</RedeemButton>
  }

  return (
    <Container>
      <Hero>
        <div>Bonds</div>
        <HeroSubtext>buy and redeem bonds</HeroSubtext>
      </Hero>
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
          value={amountOut1}
          onChange={(value: string) => console.log(value)}
          title={'To'}
          disabled={true}
        />
        <PlusIcon size={'30px'} />
        <RowEnd style={{ position: 'relative' }} height={'90px'}>
          <NftText>1 NFT</NftText>
          <Image src={NFT_IMG} height={'90px'} alt="nft" />
        </RowEnd>
        {/* <InputBox
          currency={deusCurrency}
          value={amountOut2}
          onChange={(value: string) => console.log(value)}
          title={'To ($)'}
          disabled={true}
        /> */}
        {
          <Row mt={'8px'}>
            {/* <ToolTip id="id" /> */}
            <Info data-for="id" data-tip={'Tool tip for hint client'} size={15} />
            <Description>
              you will get an NFT {`"Reduction Time"`} that will let you {` `}
              <ExternalLink style={{ textDecoration: 'underline' }} href="">
                redeem your bDEI later
              </ExternalLink>
              .
            </Description>
          </Row>
        }
        <div style={{ marginTop: '20px' }}></div>
        {getApproveButton()}
        {getActionButton()}
      </Wrapper>
      <RedemptionInfoBox />
      <Disclaimer />
    </Container>
  )
}
