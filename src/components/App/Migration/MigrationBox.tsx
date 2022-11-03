import React, { useCallback, useEffect, useMemo, useState } from 'react'
import styled, { useTheme } from 'styled-components'
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
import { useClaimableBDEI, useGetPrice } from 'hooks/useMigratorPage'
import { Container } from './SelectBox'
import { Row, RowBetween, RowCenter } from 'components/Row'
import toast from 'react-hot-toast'
import { toBN } from 'utils/numbers'
import LeverageArrow from './LeverageArrow'

export const Wrapper = styled(Container)`
  background: ${({ theme }) => theme.bg1};
  border: 1px solid rgb(0, 0, 0);
  border-radius: 0 12px 12px 0;
  width: 440px;
  height: 460px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    border-radius: 12px;
    margin-top: 20px;
    width: 340px;
    height: 430px;
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
  font-size: 14px;
  margin-left: 8px;
  color: ${({ theme }) => theme.warning};
  max-width: 370px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    max-width: 250px;
  `}
`

const TotalValueSpan = styled.span`
  background: -webkit-linear-gradient(180deg, #e29c53 0%, #ce4c7a 60%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: bold;
  line-height: 20px;
`

const BottomWrap = styled(RowBetween)`
  background: #121212;
  padding-right: 8px;
  padding-left: 8px;
`

export const TopBorderWrap = styled.div`
  background: ${({ theme }) => theme.primary2};
  padding: 1px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.bg0};
`

export const TopBorder = styled.div`
  background: ${({ theme }) => theme.bg0};
  border-radius: 6px;
`

const BatteryWrap = styled(RowCenter)`
  position: relative;
  overflow: hidden;
  border-radius: 4px;
  color: ${({ theme }) => theme.white};
  width: 60px;
  height: 28px;
  font-size: 12px;

  & > * {
    &:first-child {
      z-index: 100;
    }
  }
`

const BatteryPercentage = styled.div<{ width?: string }>`
  background: ${({ theme }) => theme.primary1};
  width: ${({ width }) => width ?? 'unset'};
  height: 100%;
  left: 0;
  bottom: 0;
  position: absolute;
  z-index: 2;
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
  const leverage = useMemo(() => migrationState.leverage, [migrationState])

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

  const { availableClaimableBDEI, totalClaimableBDEI } = useClaimableBDEI()
  const { vDEUSPrice } = useGetPrice()
  const expiredPrice = useExpiredPrice()

  const percentage = useMemo(() => {
    return ((Number(availableClaimableBDEI) / Number(totalClaimableBDEI)) * 100).toFixed(0)
  }, [availableClaimableBDEI, totalClaimableBDEI])

  useEffect(() => {
    const methodName = migrationState?.methodName
    if (methodName === 'legacyDEIToBDEI') setAmountOut((Number(amountIn) * leverage).toString())
    else if (methodName === 'vDEUSToBDEI') {
      const val = toBN(amountIn).multipliedBy(toBN(vDEUSPrice))
      setAmountOut(amountIn ? (Number(val.toString()) * leverage).toString() : '')
    } else if (outputCurrency?.symbol === 'vDEUS') {
      const val = toBN(amountIn).dividedBy(toBN(vDEUSPrice))
      setAmountOut(amountIn ? (Number(val.toString()) * leverage).toString() : '')
    } else {
      setAmountOut((Number(amountIn) * leverage).toString())
    }
  }, [amountIn, inputCurrency.symbol, leverage, migrationState?.methodName, outputCurrency?.symbol, vDEUSPrice])

  useEffect(() => {
    setExceedBalance(!!(amountOut > availableClaimableBDEI))
  }, [amountOut, availableClaimableBDEI])

  const { callback: migrationCallback } = useMigrationCallback(migrationState, currencyAmount)
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
    // @ts-ignore
    if (isNaN(availableClaimableBDEI) && outputCurrency?.symbol === 'bDEI') {
      return <MainButton disabled>You are not whitelisted</MainButton>
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
    else if (inputCurrency?.symbol === 'legacyDEI') setAmountIn(availableClaimableBDEI)
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

        {leverage === 1 ? <ArrowDown /> : <LeverageArrow leverage={leverage} arrowDirection={'down'} />}

        <InputBox currency={outputCurrency} value={amountOut} onChange={() => null} disabled />

        <div style={{ marginTop: '40px' }}></div>

        {getApproveButton()}
        {getActionButton()}
      </MainWrapper>

      {account && migrationState.snapshotConfirmation && (
        <BottomWrap>
          {/* @ts-ignore */}
          {!isNaN(availableClaimableBDEI) && availableClaimableBDEI > 0 && (
            <>
              <Row mt={'8px'} mb={'12px'} style={{ cursor: 'pointer' }} onClick={handleMaxValue}>
                <Description style={{ color: theme.text2 }}>
                  <span style={{ color: '#7CD985', fontWeight: 'bold' }}>{availableClaimableBDEI}</span> of{' '}
                  <TotalValueSpan>{totalClaimableBDEI}</TotalValueSpan> bDEI
                  <span style={{ display: 'block' }}>Available for Migration</span>
                </Description>
              </Row>

              <TopBorderWrap>
                <TopBorder>
                  <BatteryWrap>
                    <p>{percentage}%</p>
                    <BatteryPercentage width={percentage + '%'}></BatteryPercentage>
                  </BatteryWrap>
                </TopBorder>
              </TopBorderWrap>
            </>
          )}

          {/* {exceedBalance && (
              <Row mt={'15px'}>
                <Info size={16} color={theme.warning} />
                <Description>The entered amount exceed your claimable balance.</Description>
              </Row>
            )} */}
        </BottomWrap>
      )}
    </Wrapper>
  )
}
