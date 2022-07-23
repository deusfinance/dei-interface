import React, { useState, useMemo, useCallback, useEffect } from 'react'
import styled from 'styled-components'
import { darken } from 'polished'
import { ArrowDown } from 'react-feather'
import { toast } from 'react-hot-toast'

import { useCurrencyBalance } from 'state/wallet/hooks'
import { useWalletModalToggle } from 'state/application/hooks'
import useWeb3React from 'hooks/useWeb3'
import useDebounce from 'hooks/useDebounce'
import { useSupportedChainId } from 'hooks/useSupportedChainId'
import { useERC721ApproveAllCallback, ApprovalState } from 'hooks/useApproveNftCallback2'
import useRedemptionCallback from 'hooks/useRedemptionCallback'
import { useRedeemAmountsOut, useRedeemData } from 'hooks/useRedemptionPage'

import { tryParseAmount } from 'utils/parse'
import { getRemainingTime } from 'utils/time'
import { DefaultHandlerError } from 'utils/parseError'

import { DEI_TOKEN, USDC_TOKEN } from 'constants/tokens'
import { vDeus, vDeusRedeemer } from 'constants/addresses'

import { PrimaryButton } from 'components/Button'
import { DotFlashing, Info } from 'components/Icons'
import { Row } from 'components/Row'
import Hero, { HeroSubtext } from 'components/Hero'
import Disclaimer from 'components/Disclaimer'
import InputBox from 'components/App/Redemption/InputBox'
import RedemptionInfoBox from 'components/App/Redemption/RedemptionInfoBox'
import Dropdown from 'components/DropDown'
import { useVDeusStats } from 'hooks/useVDeusStats'
import { useTransactionAdder } from 'state/transactions/hooks'

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

const DropdownWrapper = styled.div`
  margin: 0 auto;
  margin-top: 15px;
  height: 60px;
  width: 100%;
  border-radius: 10px;

  & > * {
    height: 100%;
  }
`

const RedeemButton = styled(PrimaryButton)`
  border-radius: 15px;
`

export default function Redemption() {
  const { chainId, account } = useWeb3React()
  const toggleWalletModal = useWalletModalToggle()
  const isSupportedChainId = useSupportedChainId()
  const [amountIn, setAmountIn] = useState('')
  const [selectedNftId, setSelectedNftId] = useState('0')
  const addTransaction = useTransactionAdder()

  const debouncedAmountIn = useDebounce(amountIn, 500)
  const deiCurrency = DEI_TOKEN
  const usdcCurrency = USDC_TOKEN
  const deiCurrencyBalance = useCurrencyBalance(account ?? undefined, deiCurrency)

  const [dropDownDefaultValue, setDropDownDefaultValue] = useState<string | undefined>('0')
  const { listOfVouchers, numberOfVouchers } = useVDeusStats()

  const dropdownOnSelect = useCallback((val: string) => {
    setSelectedNftId(val)
    setDropDownDefaultValue(val)
    // console.log('draw down on select', { val })
    return
  }, [])

  const dropdownOptions = listOfVouchers.map((tokenId: number) => ({
    label: `vDEUS #${tokenId}`,
    value: `${tokenId}`,
  }))

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

  const usdcAmount = useMemo(() => {
    return tryParseAmount(amountOut1, usdcCurrency || undefined)
  }, [amountOut1, usdcCurrency])

  const {
    state: redeemCallbackState,
    callback: redeemCallback,
    error: redeemCallbackError,
  } = useRedemptionCallback(deiCurrency, usdcCurrency, deiAmount, usdcAmount, amountOut2)

  const [awaitingRedeemConfirmation, setAwaitingRedeemConfirmation] = useState<boolean>(false)

  const spender = useMemo(() => (chainId ? vDeusRedeemer[chainId] : undefined), [chainId])
  const [awaitingApproveConfirmation, setAwaitingApproveConfirmation] = useState<boolean>(false)
  const [approvalState, approveCallback] = useERC721ApproveAllCallback(chainId ? vDeus[chainId] : undefined, spender)
  const showApprove = useMemo(() => approvalState !== ApprovalState.APPROVED, [approvalState])

  const { diff } = getRemainingTime(redeemTranche.endTime)

  const handleApprove = async () => {
    setAwaitingApproveConfirmation(true)
    await approveCallback()
    setAwaitingApproveConfirmation(false)
  }

  useEffect(() => {
    setDropDownDefaultValue(undefined)
  }, [])

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
    if (!isSupportedChainId || !account || numberOfVouchers <= 0) {
      return null
    }

    if (awaitingApproveConfirmation) {
      return (
        <RedeemButton active>
          Awaiting Confirmation <DotFlashing style={{ marginLeft: '10px' }} />
        </RedeemButton>
      )
    }

    if (showApprove) {
      return <RedeemButton onClick={handleApprove}>Approve vDEUS</RedeemButton>
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

    if (diff < 0 && redeemTranche.trancheId != null) {
      return <RedeemButton disabled>Tranche Ended</RedeemButton>
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
          Redeeming DEI <DotFlashing style={{ marginLeft: '10px' }} />
        </RedeemButton>
      )
    }

    return <RedeemButton onClick={() => handleRedeem()}>Redeem DEI</RedeemButton>
  }

  const onDeposit = useCallback(
    async (pid: number) => {
      try {
        if (!account || !isSupportedChainId) return
        setAwaitingRedeemConfirmation(true)
        // const response = await stakingContract.deposit(pid, selectedNftId, account)
        // addTransaction(response, { summary: `Deposit vDEUS #${selectedNftId}` })
        setAwaitingRedeemConfirmation(false)
        // setPendingTxHash(response.hash)
      } catch (err) {
        console.log(err)
        toast.error(DefaultHandlerError(err))
        setAwaitingRedeemConfirmation(false)
        // setPendingTxHash('')
      }
    },
    [addTransaction, account, selectedNftId, isSupportedChainId]
  )

  return (
    <Container>
      <Hero>
        <div>vDEUS Redemption</div>
        <HeroSubtext>redeem your vDEUS</HeroSubtext>
      </Hero>
      <Wrapper>
        <DropdownWrapper>
          <Dropdown
            options={dropdownOptions}
            placeholder="select an NFT"
            defaultValue={dropDownDefaultValue}
            onSelect={(v) => dropdownOnSelect(v)}
            width="100%"
          />
        </DropdownWrapper>
        <ArrowDown />

        <InputBox
          currency={deiCurrency}
          value={amountOut2}
          onChange={(value: string) => setAmountIn(value)}
          title={'To'}
          disabled={true}
        />

        {
          <Row mt={'8px'}>
            <Info data-for="id" data-tip={'Tool tip for hint client'} size={15} />
            <Description>you will get an NFT {`"DEUS voucher"`} that will let you claim DEUS later .</Description>
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
