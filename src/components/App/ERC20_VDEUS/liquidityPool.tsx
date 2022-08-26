import React, { useState, useMemo, useCallback } from 'react'
import styled from 'styled-components'

import { useCurrencyBalance } from 'state/wallet/hooks'
import { useWalletModalToggle } from 'state/application/hooks'
import useWeb3React from 'hooks/useWeb3'
import { useSupportedChainId } from 'hooks/useSupportedChainId'
import useApproveCallback, { ApprovalState } from 'hooks/useApproveCallback'
import { tryParseAmount } from 'utils/parse'

import { PrimaryButton } from 'components/Button'
import { DotFlashing } from 'components/Icons'
import InputBox from 'components/App/Redemption/InputBox'
import { DEUS_TOKEN, VDEUS_TOKEN } from 'constants/tokens'
import { useAddLiquidity, useRemoveLiquidity } from 'hooks/useStablePoolInfo'
import useManageLiquidity from 'hooks/useLiquidityCallback'
import { VDeusLiquidityPools } from 'constants/sPools'
import { ActionTypes, ActionSetter } from 'components/Liquidity'
import AdvancedOptions from 'components/App/Swap/AdvancedOptions'
import useDebounce from 'hooks/useDebounce'
import { ArrowDown } from 'react-feather'

const Wrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  margin: 0 10px;
  margin-top: 50px;
  width: 420px;
  background-color: rgb(13 13 13);
  padding: 20px 15px;
  border: 1px solid rgb(0, 0, 0);
  border-radius: 15px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    margin-left: 20px;
  `}

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    width: 340px;
  `}
`

const ToggleState = styled.div`
  margin-top: -10px;
  margin-bottom: 20px;
`

const DepositButton = styled(PrimaryButton)`
  border-radius: 15px;
`

const AdvancedOptionsWrap = styled.div`
  & > * {
    margin-top: 20px !important;
    padding: 0;
  }
`

export default function LiquidityPool() {
  const { chainId, account } = useWeb3React()
  const toggleWalletModal = useWalletModalToggle()
  const isSupportedChainId = useSupportedChainId()
  const [amountIn, setAmountIn] = useState('')
  const [amountIn2, setAmountIn2] = useState('')
  const [lpAmountIn, setLPAmountIn] = useState('')
  const [selected, setSelected] = useState<ActionTypes>(ActionTypes.ADD)
  const isRemove = useMemo(() => selected == ActionTypes.REMOVE, [selected])
  const [slippage, setSlippage] = useState(0.5)
  const deusCurrency = DEUS_TOKEN
  const vdeusCurrency = VDEUS_TOKEN
  const isERC20 = true

  const pool = VDeusLiquidityPools[0]
  const lpCurrency = pool.lpToken
  const deusCurrencyBalance = useCurrencyBalance(account ?? undefined, deusCurrency)
  const vdeusCurrencyBalance = useCurrencyBalance(account ?? undefined, vdeusCurrency)
  // const lpCurrencyBalance = useCurrencyBalance(account ?? undefined, lpCurrency)

  const debouncedAmountIn = useDebounce(amountIn, 500)
  const debouncedAmountIn2 = useDebounce(amountIn2, 500)
  const debouncedLPAmountIn = useDebounce(lpAmountIn, 500)

  const amountOut = useRemoveLiquidity(pool, debouncedLPAmountIn, isERC20)
  const amountOut2 = useAddLiquidity(pool, [debouncedAmountIn, debouncedAmountIn2], isERC20).toString()

  const deusAmount = useMemo(() => {
    return tryParseAmount(amountIn, deusCurrency || undefined)
  }, [amountIn, deusCurrency])

  const vdeusAmount = useMemo(() => {
    return tryParseAmount(amountIn2, vdeusCurrency || undefined)
  }, [amountIn2, vdeusCurrency])

  const insufficientBalance = useMemo(() => {
    // TODO: complete this later
    if (!deusAmount || !vdeusAmount) return false
    return deusCurrencyBalance?.lessThan(deusAmount) && vdeusCurrencyBalance?.lessThan(vdeusAmount)
  }, [deusCurrencyBalance, vdeusCurrencyBalance, deusAmount, vdeusAmount])

  const {
    state: liquidityCallbackState,
    callback: liquidityCallback,
    error: liquidityCallbackError,
  } = useManageLiquidity(
    isRemove ? amountOut : [debouncedAmountIn, debouncedAmountIn2],
    isRemove ? lpAmountIn : amountOut2,
    pool,
    slippage,
    20,
    isRemove,
    isERC20
  )

  const [awaitingApproveConfirmation, setAwaitingApproveConfirmation] = useState(false)
  const [awaitingLiquidityConfirmation, setAwaitingLiquidityConfirmation] = useState(false)
  const spender = useMemo(() => (chainId ? pool.DB_Pool : undefined), [chainId, pool])

  const [approvalState, approveCallback] = useApproveCallback(vdeusCurrency ?? undefined, spender)
  const [showApprove, showApproveLoader] = useMemo(() => {
    const show = vdeusCurrency && approvalState !== ApprovalState.APPROVED && !!amountIn
    return [show, show && approvalState === ApprovalState.PENDING]
  }, [vdeusCurrency, approvalState, amountIn])

  const [approvalState2, approveCallback2] = useApproveCallback(deusCurrency ?? undefined, spender)
  const [showApprove2, showApproveLoader2] = useMemo(() => {
    const show = deusCurrency && approvalState2 !== ApprovalState.APPROVED && !!amountIn2
    return [show, show && approvalState2 === ApprovalState.PENDING]
  }, [deusCurrency, approvalState2, amountIn2])

  const [approvalState3, approveCallback3] = useApproveCallback(lpCurrency ?? undefined, spender)
  const [showApprove3, showApproveLoader3] = useMemo(() => {
    const show = lpCurrency && approvalState3 !== ApprovalState.APPROVED && !!lpAmountIn
    return [show, show && approvalState3 === ApprovalState.PENDING]
  }, [lpCurrency, approvalState3, lpAmountIn])

  const handleApprove = async () => {
    setAwaitingApproveConfirmation(true)
    await approveCallback()
    setAwaitingApproveConfirmation(false)
  }

  const handleApprove2 = async () => {
    setAwaitingApproveConfirmation(true)
    await approveCallback2()
    setAwaitingApproveConfirmation(false)
  }

  const handleApprove3 = async () => {
    setAwaitingApproveConfirmation(true)
    await approveCallback3()
    setAwaitingApproveConfirmation(false)
  }

  const handleLiquidity = useCallback(async () => {
    console.log('called handleLiquidity')
    console.log(liquidityCallbackState, liquidityCallbackError)
    if (!liquidityCallback) return
    try {
      setAwaitingLiquidityConfirmation(true)
      const txHash = await liquidityCallback()
      setAwaitingLiquidityConfirmation(false)
      console.log({ txHash })
    } catch (e) {
      setAwaitingLiquidityConfirmation(false)
      if (e instanceof Error) {
        // error = e.message
      } else {
        console.error(e)
        // error = 'An unknown error occurred.'
      }
    }
  }, [liquidityCallbackState, liquidityCallback, liquidityCallbackError])

  function getApproveButton(type: string): JSX.Element | null {
    if (!isSupportedChainId || !account || !type) {
      return null
    }
    if (awaitingApproveConfirmation) {
      return (
        <DepositButton active>
          Awaiting Confirmation <DotFlashing style={{ marginLeft: '10px' }} />
        </DepositButton>
      )
    }
    if (showApproveLoader || showApproveLoader2 || showApproveLoader3) {
      return (
        <DepositButton active>
          Approving <DotFlashing style={{ marginLeft: '10px' }} />
        </DepositButton>
      )
    }
    if (showApprove && type === 'add')
      return <DepositButton onClick={handleApprove}>Allow us to spend {vdeusCurrency?.symbol}</DepositButton>
    else if (showApprove2 && type === 'add')
      return <DepositButton onClick={handleApprove2}>Allow us to spend {deusCurrency?.symbol}</DepositButton>
    else if (showApprove3 && type === 'remove')
      return <DepositButton onClick={handleApprove3}>Allow us to spend {lpCurrency?.symbol}</DepositButton>

    return null
  }

  function getActionButton(type: string): JSX.Element | null {
    if (!chainId || !account || !type) return <DepositButton onClick={toggleWalletModal}>Connect Wallet</DepositButton>
    else if ((showApprove || showApprove2) && type === 'add') return null
    else if (showApprove3 && type === 'remove') return null
    else if (insufficientBalance)
      return <DepositButton disabled>Insufficient {deusCurrency?.symbol} Balance</DepositButton>
    else if (awaitingLiquidityConfirmation) {
      return (
        <DepositButton>
          {type === 'add' ? 'Depositing DEUS/vDEUS' : 'Withdrawing DEUS/vDEUS'}
          <DotFlashing style={{ marginLeft: '10px' }} />
        </DepositButton>
      )
    }
    return <DepositButton onClick={() => handleLiquidity()}>{type === 'add' ? 'Deposit' : 'Withdraw'}</DepositButton>
  }

  const getAppComponent = (): JSX.Element => {
    if (selected == ActionTypes.REMOVE) {
      return (
        <>
          <InputBox
            currency={lpCurrency}
            value={lpAmountIn}
            onChange={(value: string) => setLPAmountIn(value)}
            title={'From'}
          />
          <ArrowDown style={{ margin: '12px auto' }} />

          <InputBox
            currency={vdeusCurrency}
            value={amountOut[0]?.toString()}
            onChange={() => console.debug('')}
            title={'To'}
            disabled
          />

          <div style={{ marginTop: '20px' }}></div>
          <InputBox
            currency={deusCurrency}
            value={amountOut[1]?.toString()}
            onChange={() => console.debug('')}
            title={'To'}
            disabled
            disable_vdeus
          />
          <div style={{ marginTop: '20px' }}></div>
          {getApproveButton('remove')}
          {getActionButton('remove')}
        </>
      )
    } else {
      return (
        <>
          <InputBox
            currency={vdeusCurrency}
            value={amountIn}
            onChange={(value: string) => setAmountIn(value)}
            title={'From'}
          />

          <div style={{ marginTop: '20px' }}></div>

          <InputBox
            currency={deusCurrency}
            value={amountIn2}
            onChange={(value: string) => setAmountIn2(value)}
            title={'From'}
            disable_vdeus
          />

          <div style={{ marginTop: '20px' }}></div>
          {getApproveButton('add')}
          {getActionButton('add')}
        </>
      )
    }
  }

  return (
    <div>
      <Wrapper>
        <ToggleState>
          <ActionSetter selected={selected} setSelected={setSelected} />
        </ToggleState>

        {getAppComponent()}
        <AdvancedOptionsWrap>
          <AdvancedOptions slippage={slippage} setSlippage={setSlippage} />
        </AdvancedOptionsWrap>
      </Wrapper>
    </div>
  )
}
