import React, { useState, useMemo, useCallback, useEffect } from 'react'
import styled, { useTheme } from 'styled-components'

import Hero, { HeroSubtext } from 'components/Hero'
import Disclaimer from 'components/Disclaimer'

import { ArrowDown } from 'react-feather'
import { useWalletModalToggle } from 'state/application/hooks'
import useWeb3React from 'hooks/useWeb3'
import { ApprovalState } from 'hooks/useApproveNftCallback'
import { useSupportedChainId } from 'hooks/useSupportedChainId'

import { PrimaryButton } from 'components/Button'
import { DotFlashing, Info } from 'components/Icons'
import InputBox from 'components/App/Redemption/InputBox'
import { DeiBonderV3 } from 'constants/addresses'
import { BDEI_TOKEN, DEI_TOKEN, VDEUS_TOKEN } from 'constants/tokens'
import { useExpiredPrice } from 'state/dashboard/hooks'
import useUpdateCallback from 'hooks/useOracleCallback'
import TokensModal from 'components/App/Swap/TokensModal'
import { Currency } from '@sushiswap/core-sdk'
import { Row } from 'components/Row'
import useApproveCallback from 'hooks/useApproveCallback'
import useMigrationCallback from 'hooks/usebDEICallback'
import { tryParseAmount } from 'utils/parse'
import { useClaimableBDEI, useGetPrice } from 'hooks/usebDEIPage'
import { toBN } from 'utils/numbers'
import toast from 'react-hot-toast'

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

const MainButton = styled(PrimaryButton)`
  border-radius: 15px;
`

const Description = styled.div`
  font-size: 0.85rem;
  line-height: 1.25rem;
  margin-left: 10px;
  color: ${({ theme }) => theme.warning};
`

const MaxCircle = styled.div`
  background: ${({ theme }) => theme.bg2};
  border-radius: 6px;
  padding: 3px 5px 4px 5px;
  font-size: 0.6rem;
  color: ${({ theme }) => theme.text1};
  margin-left: 6px;

  &:hover {
    background: ${({ theme }) => theme.secondary2};
  }
`

export default function Migrator2() {
  const { chainId, account } = useWeb3React()
  const toggleWalletModal = useWalletModalToggle()
  const isSupportedChainId = useSupportedChainId()
  const bDEICurrency = BDEI_TOKEN
  const DEICurrency = DEI_TOKEN
  const vDEUSCurrency = VDEUS_TOKEN
  const theme = useTheme()

  const [amountIn, setAmountIn] = useState('')
  const [amountOut, setAmountOut] = useState('')
  const [exceedBalance, setExceedBalance] = useState(false)

  const expiredPrice = useExpiredPrice()

  const [inputCurrency, setInputCurrency] = useState<Currency>(DEICurrency)
  const currencyAmount = useMemo(() => {
    return tryParseAmount(amountIn, inputCurrency || undefined)
  }, [amountIn, inputCurrency])

  const { totalClaimableBDEI, availableClaimableBDEI } = useClaimableBDEI()
  const { vDEUSPrice } = useGetPrice()

  useEffect(() => {
    if (inputCurrency?.symbol === 'DEI') setAmountOut(amountIn)
    else {
      const val = toBN(amountIn).multipliedBy(toBN(vDEUSPrice))
      setAmountOut(amountIn ? val.toString() : '')
    }
  }, [amountIn, inputCurrency?.symbol, vDEUSPrice])

  useEffect(() => {
    setExceedBalance(!!(amountOut > availableClaimableBDEI))
  }, [amountOut, availableClaimableBDEI])

  const { callback: migrationCallback } = useMigrationCallback(inputCurrency, currencyAmount, totalClaimableBDEI)
  const { callback: updateOracleCallback } = useUpdateCallback()

  const [awaitingApproveConfirmation, setAwaitingApproveConfirmation] = useState(false)
  const [awaitingMigrateConfirmation, setAwaitingMigrateConfirmation] = useState(false)
  const [awaitingUpdateConfirmation, setAwaitingUpdateConfirmation] = useState(false)

  const [isOpenTokensModal, toggleTokensModal] = useState(false)

  const spender = useMemo(() => (chainId ? DeiBonderV3[chainId] : undefined), [chainId])
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

  const handleMigrate = useCallback(async () => {
    console.log('called handleMigrate')
    if (!migrationCallback) return
    try {
      setAwaitingMigrateConfirmation(true)
      const txHash = await migrationCallback()
      setAwaitingMigrateConfirmation(false)
      console.log({ txHash })
    } catch (e) {
      setAwaitingMigrateConfirmation(false)
      if (e instanceof Error) {
        // error = e.message
      } else {
        console.error(e)
        // error = 'An unknown error occurred.'
      }
    }
  }, [migrationCallback])

  const handleUpdatePrice = useCallback(async () => {
    if (!updateOracleCallback) return
    try {
      setAwaitingUpdateConfirmation(true)
      const txHash = await updateOracleCallback()
      console.log({ txHash })
      setAwaitingUpdateConfirmation(false)
    } catch (e) {
      setAwaitingUpdateConfirmation(false)
      if (e instanceof Error) {
        console.error(e)
      } else {
        console.error(e)
      }
    }
  }, [updateOracleCallback])

  function getApproveButton(): JSX.Element | null {
    if (!isSupportedChainId || !account) {
      return null
    }
    if (awaitingApproveConfirmation) {
      return (
        <MainButton active>
          Awaiting Confirmation <DotFlashing />
        </MainButton>
      )
    }
    if (showApprove) {
      return <MainButton onClick={handleApprove}>Approve {inputCurrency?.symbol}</MainButton>
    }
    return null
  }

  function getActionButton(): JSX.Element | null {
    if (!chainId || !account) {
      return <MainButton onClick={toggleWalletModal}>Connect Wallet</MainButton>
    }
    if (showApprove) {
      return null
    }
    if (awaitingUpdateConfirmation) {
      return (
        <MainButton>
          Updating Oracle <DotFlashing />
        </MainButton>
      )
    }
    if (expiredPrice) {
      return <MainButton onClick={handleUpdatePrice}>Update Oracle</MainButton>
    }

    if (awaitingMigrateConfirmation) {
      return (
        <MainButton>
          Migrating to {bDEICurrency?.symbol} <DotFlashing />
        </MainButton>
      )
    }
    return (
      <MainButton disabled={exceedBalance} onClick={() => handleMigrate()}>
        Migrate to {bDEICurrency?.symbol}
      </MainButton>
    )
  }

  const handleMaxValue = useCallback(async () => {
    if (expiredPrice) toast.error('Please update oracle')
    else if (inputCurrency?.symbol === 'DEI') setAmountIn(availableClaimableBDEI)
    else setAmountIn(toBN(availableClaimableBDEI).dividedBy(toBN(vDEUSPrice)).toString())
  }, [availableClaimableBDEI, expiredPrice, inputCurrency?.symbol, vDEUSPrice])

  return (
    <Container>
      <Hero>
        <div>bDEI Migrator</div>
        <HeroSubtext>Migrate your DEI/vDEUS to bDEI</HeroSubtext>
      </Hero>
      <Wrapper>
        <InputBox
          currency={inputCurrency}
          value={amountIn}
          onChange={(value: string) => setAmountIn(value)}
          title={'From'}
          onTokenSelect={() => {
            toggleTokensModal(true)
          }}
          disabled={expiredPrice}
        />
        <ArrowDown />

        <InputBox
          currency={bDEICurrency}
          value={amountOut}
          onChange={(value: string) => console.log(value)}
          title={'To'}
          disabled={true}
        />
        <Row mt={'18px'} style={{ cursor: 'pointer' }} onClick={handleMaxValue}>
          <Info size={16} />
          <Description style={{ color: 'white' }}>Your Claimable BDEI is: {availableClaimableBDEI}</Description>
          <MaxCircle>Max</MaxCircle>
        </Row>
        {exceedBalance && (
          <Row mt={'18px'}>
            <Info size={16} color={theme.warning} />
            <Description>The entered amount exceed your claimable balance.</Description>
          </Row>
        )}
        <div style={{ marginTop: '20px' }}></div>
        {getApproveButton()}
        {getActionButton()}
      </Wrapper>
      <TokensModal
        isOpen={isOpenTokensModal}
        toggleModal={(action: boolean) => toggleTokensModal(action)}
        tokens={[DEICurrency, vDEUSCurrency]}
        setToken={(currency: Currency) => setInputCurrency(currency)}
      />

      <Disclaimer />
    </Container>
  )
}
