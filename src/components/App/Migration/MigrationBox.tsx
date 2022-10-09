import React, { useCallback, useEffect, useMemo, useState } from 'react'
import styled, { useTheme } from 'styled-components'
import { isMobile } from 'react-device-detect'
import { ArrowDown } from 'react-feather'
import useWeb3React from 'hooks/useWeb3'
import { useWalletModalToggle } from 'state/application/hooks'
import { useSupportedChainId } from 'hooks/useSupportedChainId'
import { DotFlashing, Info } from 'components/Icons'
import { PrimaryButton } from 'components/Button'
import useApproveCallback, { ApprovalState } from 'hooks/useApproveCallback'
import { Migrator } from 'constants/addresses'
import useMigrationCallback from 'hooks/useMigratorCallback'
import { tryParseAmount } from 'utils/parse'
import useUpdateCallback from 'hooks/useOracleCallback'
import { useExpiredPrice } from 'state/dashboard/hooks'
import InputBox from 'components/InputBox'
import { MigrationStates } from 'constants/migration'
import { useClaimableBDEI, useGetPrice } from 'hooks/useMigratorPage'
import { Container } from './SelectBox'
import { Row } from 'components/Row'
import toast from 'react-hot-toast'
import { toBN } from 'utils/numbers'

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

const Description = styled.div`
  font-size: 13px;
  margin-left: 8px;
  color: ${({ theme }) => theme.warning};
  max-width: 370px;
`

const MaxButtonWrap = styled.div`
  background: ${({ theme }) => theme.bg2};
  border-radius: 8px;
  padding: 4px 6px 5px 6px;
  font-size: 0.6rem;
  color: ${({ theme }) => theme.text1};
  margin-left: 6px;

  &:hover {
    background: ${({ theme }) => theme.primary1};
  }
`

export const getImageSize = () => {
  return isMobile ? 35 : 38
}

export default function MigrationBox({ activeState }: { activeState: number }) {
  const { chainId, account } = useWeb3React()
  const toggleWalletModal = useWalletModalToggle()
  const isSupportedChainId = useSupportedChainId()
  const theme = useTheme()

  const [amountIn, setAmountIn] = useState('')
  const [amountOut, setAmountOut] = useState('')
  const [exceedBalance, setExceedBalance] = useState(false)

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
  const { vDEUSPrice } = useGetPrice()
  const expiredPrice = useExpiredPrice()

  useEffect(() => {
    const methodName = migrationState?.methodName
    if (methodName === 'legacyDEIToBDEI') setAmountOut(amountIn)
    if (methodName === 'vDEUSToBDEI') {
      const val = toBN(amountIn).multipliedBy(toBN(vDEUSPrice))
      setAmountOut(amountIn ? val.toString() : '')
    }
    if (outputCurrency?.symbol === 'vDEUS') {
      const val = toBN(amountIn).dividedBy(toBN(vDEUSPrice))
      setAmountOut(amountIn ? val.toString() : '')
    } else {
      setAmountOut(amountIn)
    }
  }, [amountIn, inputCurrency.symbol, migrationState?.methodName, outputCurrency?.symbol, vDEUSPrice])

  useEffect(() => {
    setExceedBalance(!!(amountOut > availableClaimableBDEI))
  }, [amountOut, availableClaimableBDEI])

  const { callback: migrationCallback } = useMigrationCallback(migrationState, currencyAmount, totalClaimableBDEI)
  const { callback: updateOracleCallback } = useUpdateCallback()

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

  const handleMaxValue = useCallback(async () => {
    if (expiredPrice) toast.error('Please update oracle')
    else if (inputCurrency?.symbol === 'DEI') setAmountIn(availableClaimableBDEI)
    else setAmountIn(toBN(availableClaimableBDEI).dividedBy(toBN(vDEUSPrice)).toString())
  }, [availableClaimableBDEI, expiredPrice, inputCurrency?.symbol, vDEUSPrice])

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
        <InputBox currency={outputCurrency} value={amountOut} onChange={() => null} disabled />

        <div style={{ marginTop: '40px' }}></div>

        {getApproveButton()}
        {getActionButton()}

        {account && migrationState.snapshotConfirmation && (
          <Row mt={'18px'} style={{ cursor: 'pointer' }} onClick={handleMaxValue}>
            <Info size={16} />
            <Description style={{ color: 'white' }}>Your Claimable BDEI is: {availableClaimableBDEI}</Description>
            <MaxButtonWrap>Max</MaxButtonWrap>
          </Row>
        )}
        {account && migrationState.snapshotConfirmation && exceedBalance && (
          <Row mt={'15px'}>
            <Info size={16} color={theme.warning} />
            <Description>The entered amount exceed your claimable balance.</Description>
          </Row>
        )}
      </MainWrapper>
    </Wrapper>
  )
}
