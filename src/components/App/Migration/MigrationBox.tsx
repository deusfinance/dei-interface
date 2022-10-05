import React, { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import { isMobile } from 'react-device-detect'
import { DEI_TOKEN } from 'constants/tokens'
import InputBox from '../Redemption/InputBox'
import { ArrowDown } from 'react-feather'
import useWeb3React from 'hooks/useWeb3'
import { useWalletModalToggle } from 'state/application/hooks'
import { useSupportedChainId } from 'hooks/useSupportedChainId'
import { DotFlashing } from 'components/Icons'
import { PrimaryButton } from 'components/Button'
import { Currency } from '@sushiswap/core-sdk'
import useApproveCallback, { ApprovalState } from 'hooks/useApproveCallback'
import { DeiBonderV3 } from 'constants/addresses'
import useMigrationCallback from 'hooks/usebDEICallback'
import { tryParseAmount } from 'utils/parse'
import useUpdateCallback from 'hooks/useOracleCallback'
import { useExpiredPrice } from 'state/dashboard/hooks'

const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  overflow: visible;
  margin: 0 auto;
`

export const Wrapper = styled(Container)`
  background: ${({ theme }) => theme.bg1};
  border: 1px solid rgb(0, 0, 0);
  border-radius: 0 12px 12px 0;
  width: 470px;
  height: 472px;
`

export const MainWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  margin: 16px auto;
  justify-content: center;

  & > * {
    &:nth-child(2) {
      margin: 15px auto;
    }
  }
`

export const Title = styled.div`
  width: 100%;
  height: 60px;
  color: ${({ theme }) => theme.text1};
  background: ${({ theme }) => theme.bg1};
  text-align: center;
  border-top-right-radius: 12px;
`

export const Text = styled.p`
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  display: inline-block;
  vertical-align: middle;
  margin: 20px 0px;
`

export const getImageSize = () => {
  return isMobile ? 35 : 38
}

const MainButton = styled(PrimaryButton)`
  border-radius: 15px;
`

export default function SelectBox() {
  const { chainId, account } = useWeb3React()
  const toggleWalletModal = useWalletModalToggle()
  const isSupportedChainId = useSupportedChainId()

  const DEICurrency = DEI_TOKEN
  const [amountIn, setAmountIn] = useState('')

  const [inputCurrency, setInputCurrency] = useState<Currency>(DEICurrency)

  // FIXME: spender is not correct
  const spender = useMemo(() => (chainId ? DeiBonderV3[chainId] : undefined), [chainId])
  const [approvalState, approveCallback] = useApproveCallback(inputCurrency ?? undefined, spender)

  const [showApprove, showApproveLoader] = useMemo(() => {
    const show = inputCurrency && approvalState !== ApprovalState.APPROVED && !!amountIn
    return [show, show && approvalState === ApprovalState.PENDING]
  }, [inputCurrency, approvalState, amountIn])

  const currencyAmount = useMemo(() => {
    return tryParseAmount(amountIn, inputCurrency || undefined)
  }, [amountIn, inputCurrency])

  const [awaitingApproveConfirmation, setAwaitingApproveConfirmation] = useState(false)
  const [awaitingMigrateConfirmation, setAwaitingMigrateConfirmation] = useState(false)
  const [awaitingUpdateConfirmation, setAwaitingUpdateConfirmation] = useState(false)

  const { callback: migrationCallback } = useMigrationCallback(inputCurrency, currencyAmount, '0')
  const { callback: updateOracleCallback } = useUpdateCallback()

  const expiredPrice = useExpiredPrice()

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
      return <MainButton onClick={handleApprove}>Approve {DEICurrency?.symbol}</MainButton>
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
          Migrating to {DEICurrency?.symbol} <DotFlashing />
        </MainButton>
      )
    }

    return <MainButton onClick={() => handleMigrate()}>Migrate to {DEICurrency?.symbol}</MainButton>
  }

  return (
    <Wrapper>
      <Title>
        <Text>
          {'Legacy DEI'} to {'vDEUS'}
        </Text>
      </Title>
      <MainWrapper>
        <InputBox
          currency={DEICurrency}
          value={amountIn}
          onChange={(value: string) => setAmountIn(value)}
          title={'From'}
        />

        <ArrowDown />

        <InputBox
          currency={DEICurrency}
          value={amountIn}
          onChange={(value: string) => setAmountIn(value)}
          title={'From'}
        />

        <div style={{ marginTop: '20px' }}></div>

        {getApproveButton()}
        {getActionButton()}
      </MainWrapper>
    </Wrapper>
  )
}
