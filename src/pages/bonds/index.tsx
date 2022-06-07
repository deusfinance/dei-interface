import React, { useState, useMemo, useCallback } from 'react'
import styled from 'styled-components'
import { darken } from 'polished'
import { ArrowDown, Plus } from 'react-feather'

import { useCurrencyBalance } from 'state/wallet/hooks'
import { useWalletModalToggle } from 'state/application/hooks'
import useWeb3React from 'hooks/useWeb3'
import useDebounce from 'hooks/useDebounce'
import { useSupportedChainId } from 'hooks/useSupportedChainId'
import useApproveCallback, { ApprovalState } from 'hooks/useApproveCallback'
import useBondsCallback from 'hooks/useBondsCallback'
import { useBondsAmountsOut, useRedeemData } from 'hooks/useBondsPage'
import { tryParseAmount } from 'utils/parse'
import { getRemainingTime } from 'utils/time'

import { PrimaryButton } from 'components/Button'
import { DotFlashing, Info } from 'components/Icons'
import { Row } from 'components/Row'
import Hero, { HeroSubtext } from 'components/Hero'
import Disclaimer from 'components/Disclaimer'
import InputBox from 'components/App/Redemption/InputBox'
import RedemptionInfoBox from 'components/App/Redemption/RedemptionInfoBox'
import { DEI_TOKEN, DEUS_TOKEN, USDC_TOKEN, BDEI_TOKEN } from 'constants/tokens'
import { DynamicRedeemer } from 'constants/addresses'
import { ExternalLink } from 'components/Link'
import { Navigation, NavigationTypes } from 'components/StableCoin'

const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  overflow: visible;
  margin: 0 auto;
`

const SelectorContainer = styled.div`
  display: flex;
  flex-flow: column nowrap;
  overflow: visible;
  margin: 0 auto;
  margin-top: 24px;
  padding-right: 24px;
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

const RedeemWrapper = styled.div`
  -webkit-filter: blur(8px);
  -moz-filter: blur(8px);
  -o-filter: blur(8px);
  -ms-filter: blur(8px);
  filter: blur(8px);
`

const MainWrapper = styled.div`
  position: relative;
`

const ComingSoon = styled.span`
  position: absolute;
  margin: 0 auto;
  padding: 20px 15px;
  justify-content: center;
  top: 39%;
  left: 43%;
  transform: translate(0, -50%);
  z-index: 2;
  font-size: 21px;
`

const Description = styled.div`
  font-size: 0.85rem;
  line-height: 1.25rem;
  margin-left: 10px;
  color: ${({ theme }) => darken(0.4, theme.text1)};
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
  const bdeiCurrency = BDEI_TOKEN
  const usdcCurrency = USDC_TOKEN
  const deusCurrency = DEUS_TOKEN
  const deiCurrencyBalance = useCurrencyBalance(account ?? undefined, deiCurrency)

  const [selected, setSelected] = useState<NavigationTypes>(NavigationTypes.MINT)

  /* const { amountIn, amountOut1, amountOut2, onUserInput, onUserOutput1, onUserOutput2 } = useRedeemAmounts() */
  const { amountOut } = useBondsAmountsOut(debouncedAmountIn, bdeiCurrency)
  // const { redeemPaused, redeemTranche } = useRedeemData()
  // console.log({ redeemPaused, rest })

  // Amount typed in either fields
  const deiAmount = useMemo(() => {
    return tryParseAmount(amountIn, deiCurrency || undefined)
  }, [amountIn, deiCurrency])

  const insufficientBalance = useMemo(() => {
    if (!deiAmount) return false
    return deiCurrencyBalance?.lessThan(deiAmount)
  }, [deiCurrencyBalance, deiAmount])

  const bdeiAmount = useMemo(() => {
    return tryParseAmount(amountOut, bdeiCurrency || undefined)
  }, [amountOut, bdeiCurrency])

  const {
    state: redeemCallbackState,
    callback: redeemCallback,
    error: redeemCallbackError,
  } = useBondsCallback(deiCurrency, bdeiCurrency, deiAmount, bdeiAmount)

  const [awaitingApproveConfirmation, setAwaitingApproveConfirmation] = useState<boolean>(false)
  const [awaitingRedeemConfirmation, setAwaitingRedeemConfirmation] = useState<boolean>(false)
  const spender = useMemo(() => (chainId ? DynamicRedeemer[chainId] : undefined), [chainId])
  const [approvalState, approveCallback] = useApproveCallback(deiCurrency ?? undefined, spender)
  const [showApprove, showApproveLoader] = useMemo(() => {
    const show = deiCurrency && approvalState !== ApprovalState.APPROVED && !!amountIn
    return [show, show && approvalState === ApprovalState.PENDING]
  }, [deiCurrency, approvalState, amountIn])

  // const { diff } = getRemainingTime(redeemTranche.endTime)

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
    if (insufficientBalance) {
      return <RedeemButton disabled>Insufficient {deiCurrency?.symbol} Balance</RedeemButton>
    }
    if (awaitingRedeemConfirmation) {
      return (
        <RedeemButton>
          BUYING DEI <DotFlashing style={{ marginLeft: '10px' }} />
        </RedeemButton>
      )
    }

    return <RedeemButton onClick={() => handleRedeem()}>BUY DEI</RedeemButton>
  }

  return (
    <Container>
      <Hero>
        <div>Bonds</div>
        <HeroSubtext>buy and redeem bonds</HeroSubtext>
      </Hero>

      <SelectorContainer>
        <Navigation selected={selected} setSelected={setSelected} />
      </SelectorContainer>

      {(selected === NavigationTypes.MINT) && (<>
        <Wrapper>
          <InputBox
            currency={deiCurrency}
            value={amountIn}
            onChange={(value: string) => setAmountIn(value)}
            title={'From'}
          />
          <ArrowDown />

          <InputBox
            currency={bdeiCurrency}
            value={amountOut}
            onChange={(value: string) => console.log(value)}
            title={'To'}
            disabled={true}
          />
          <div style={{ marginTop: '20px' }}></div>
          {getApproveButton()}
          {getActionButton()}
        </Wrapper>
      </>)}

      {(selected === NavigationTypes.REDEEM) && (<MainWrapper>
        <ComingSoon> Coming soon... </ComingSoon>
        <RedeemWrapper>
          <Wrapper>
            <InputBox
              currency={deiCurrency}
              value={amountIn}
              onChange={(value: string) => setAmountIn(value)}
              title={'From'}
            />
            <ArrowDown />

            <InputBox
              currency={bdeiCurrency}
              value={amountOut}
              onChange={(value: string) => console.log(value)}
              title={'To'}
              disabled={true}
            />
            <div style={{ marginTop: '20px' }}></div>
            {getApproveButton()}
            {getActionButton()}
          </Wrapper>
        </RedeemWrapper>
      </MainWrapper>)}


      <Disclaimer />
    </Container>
  )
}
