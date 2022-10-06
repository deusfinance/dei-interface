import React, { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import { isMobile } from 'react-device-detect'
import { ArrowDown } from 'react-feather'
import useWeb3React from 'hooks/useWeb3'
import { useWalletModalToggle } from 'state/application/hooks'
import { useSupportedChainId } from 'hooks/useSupportedChainId'
import { DotFlashing } from 'components/Icons'
import { PrimaryButton } from 'components/Button'
import useApproveCallback, { ApprovalState } from 'hooks/useApproveCallback'
import { Migrator } from 'constants/addresses'
import useMigrationCallback from 'hooks/useMigratorCallback'
import { tryParseAmount } from 'utils/parse'
import useUpdateCallback from 'hooks/useOracleCallback'
import { useExpiredPrice } from 'state/dashboard/hooks'
import InputBox from 'components/InputBox'
import { MigrationStates } from 'constants/migration'
import { useClaimableBDEI } from 'hooks/usebDEIPage'
import { Container } from './SelectBox'

export const Wrapper = styled(Container)`
  background: ${({ theme }) => theme.bg1};
  border: 1px solid rgb(0, 0, 0);
  border-radius: 0 12px 12px 0;
  width: 470px;
  height: 485px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    margin-top: 20px;
    width: 340px;
    border-radius: 12px;
  `}
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

  ${({ theme }) => theme.mediaWidth.upToMedium`
    border-radius: 12px;
  `}
`

export const Text = styled.p`
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  display: inline-block;
  vertical-align: middle;
  margin: 20px 0px;
`

const MainButton = styled(PrimaryButton)`
  border-radius: 15px;
`

export const getImageSize = () => {
  return isMobile ? 35 : 38
}

export default function MigrationBox({ activeState }: { activeState: number }) {
  const { chainId, account } = useWeb3React()
  const toggleWalletModal = useWalletModalToggle()
  const isSupportedChainId = useSupportedChainId()

  const [amountIn, setAmountIn] = useState('')
  const [amountOut, setAmountOut] = useState('')

  const migrationState = useMemo(() => MigrationStates[activeState], [activeState])
  const inputCurrency = useMemo(() => migrationState.inputToken, [migrationState])
  const outputCurrency = useMemo(() => migrationState.outputToken, [migrationState])

  const spender = useMemo(() => (chainId ? Migrator[chainId] : undefined), [chainId])
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

  const { totalClaimableBDEI, availableClaimableBDEI } = useClaimableBDEI()

  const { callback: migrationCallback } = useMigrationCallback(migrationState, currencyAmount, totalClaimableBDEI)
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
    if (expiredPrice && migrationState.oracleUpdate) {
      return <MainButton onClick={handleUpdatePrice}>Update Oracle</MainButton>
    }

    if (awaitingMigrateConfirmation) {
      return (
        <MainButton>
          Migrating to {outputCurrency?.symbol} <DotFlashing />
        </MainButton>
      )
    }

    return <MainButton onClick={() => handleMigrate()}>Migrate to {outputCurrency?.symbol}</MainButton>
  }

  return (
    <Wrapper>
      <Title>
        <Text>
          {inputCurrency?.symbol} to {outputCurrency?.symbol}
        </Text>
      </Title>
      <MainWrapper>
        <InputBox currency={inputCurrency} value={amountIn} onChange={(value: string) => setAmountIn(value)} />
        <ArrowDown />
        <InputBox currency={outputCurrency} value={amountOut} onChange={(value: string) => setAmountOut(value)} />

        <div style={{ marginTop: '40px' }}></div>

        {getApproveButton()}
        {getActionButton()}
      </MainWrapper>
    </Wrapper>
  )
}
