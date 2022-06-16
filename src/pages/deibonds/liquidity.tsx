import React, { useState, useMemo, useCallback, useEffect } from 'react'
import styled from 'styled-components'

import { useWalletModalToggle } from 'state/application/hooks'
import useWeb3React from 'hooks/useWeb3'
import { useSupportedChainId } from 'hooks/useSupportedChainId'
import { ApprovalState } from 'hooks/useApproveCallbacks'
import { useCurrencyBalances } from 'state/wallet/hooks'
import { tryParseAmount } from 'utils/parse'

import { PrimaryButton } from 'components/Button'
import { DotFlashing } from 'components/Icons'
import Hero from 'components/Hero'
import Disclaimer from 'components/Disclaimer'
import InputBox from 'components/App/Redemption/InputBox'
import { DEI_TOKEN, BDEI_TOKEN } from 'constants/tokens'
import { useAddLiquidity, useRemoveLiquidity } from 'hooks/useStablePoolInfo'
import useManageLiquidity from 'hooks/useLiquidityCallback'
import { StablePools } from 'constants/sPools'
import { ActionTypes } from 'components/StableCoin2'
import { ActionSetter } from 'components/StableCoin2'
import AdvancedOptions from 'components/App/Swap/AdvancedOptions'
import useDebounce from 'hooks/useDebounce'
import { ArrowDown } from 'react-feather'
import { StakingPools } from 'constants/stakings'
import Staking from 'components/App/deiPool/Staking'
import useApproveCallbacks from 'hooks/useApproveCallbacks'

const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  overflow: visible;
  margin: 0 auto;
`

const Wrapper = styled(Container)`
  margin-top: 50px;
  width: clamp(250px, 90%, 500px);
  background-color: rgb(13 13 13);
  padding: 20px 15px;
  border: 1px solid rgb(0, 0, 0);
  border-radius: 15px;
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
  & > * {
    &:nth-child(2) {
      margin: 15px auto;
    }
  }
`

const TopWrapper = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  width: 100%;
  max-width: 1200px;
  margin 0 auto;
`

const FarmWrapper = styled(Wrapper)`
  border-radius: 15px;
  padding: 0;
  & > * {
    &:nth-child(1) {
      padding: 0;
      border: 0;
      padding-bottom: 20px;
    }
  }
`

const LiquidityWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 50%;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    width: 100%;
    margin: 0 auto;
  `}
`

const ToggleState = styled.div`
  display: flex;
  justify-content: space-between;
  background-color: rgb(13 13 13);
  border-radius: 15px;
  margin: 0 auto;
  margin-top: 50px;
  margin-bottom: -45px;
  width: clamp(250px, 90%, 500px);
`

const DepositButton = styled(PrimaryButton)`
  border-radius: 15px;
`

export default function Liquidity() {
  const { chainId, account } = useWeb3React()
  const toggleWalletModal = useWalletModalToggle()
  const isSupportedChainId = useSupportedChainId()
  const [selected, setSelected] = useState<ActionTypes>(ActionTypes.ADD)
  const isRemove = useMemo(() => selected == ActionTypes.REMOVE, [selected])
  const [slippage, setSlippage] = useState(0.5)
  const deiCurrency = DEI_TOKEN
  const bdeiCurrency = BDEI_TOKEN
  const pool = StablePools[0]

  const [amountInArray, setAmountInArray] = useState<string[]>([])
  const debouncedArray = useDebounce(amountInArray, 500)

  const debouncedArrayMemo = useMemo(() => {
    return debouncedArray.length >= 1 ? [...debouncedArray] : ['', '']
  }, [debouncedArray])

  let amountOut = useRemoveLiquidity(pool, debouncedArrayMemo.length && isRemove ? debouncedArrayMemo[0] : '')
  const amountOut2 = useAddLiquidity(
    pool,
    debouncedArrayMemo.length > 1 ? [...debouncedArrayMemo] : ['', '']
  ).toString()

  const {
    state: liquidityCallbackState,
    callback: liquidityCallback,
    error: liquidityCallbackError,
  } = useManageLiquidity(
    isRemove ? amountOut : debouncedArray,
    isRemove ? debouncedArray[0] : amountOut2,
    pool,
    slippage,
    20,
    isRemove
  )

  const inputTokens = useMemo(
    () => ({
      [ActionTypes.ADD]: [DEI_TOKEN, BDEI_TOKEN],
      [ActionTypes.REMOVE]: [pool.lpToken],
    }),
    [pool]
  )

  const currencyBalances = useCurrencyBalances(account ?? undefined, inputTokens[selected])

  useEffect(() => {
    setAmountInArray(inputTokens[selected].map(() => ''))
  }, [selected, inputTokens])

  const [awaitingApproveConfirmation, setAwaitingApproveConfirmation] = useState<boolean>(false)
  const [awaitingLiquidityConfirmation, setAwaitingLiquidityConfirmation] = useState<boolean>(false)
  const spender = useMemo(() => (chainId ? pool.swapFlashLoan : undefined), [chainId, pool])

  const [approvalStates, handleApproveByIndex] = useApproveCallbacks(inputTokens[selected] ?? undefined, spender)
  const [showApprove, showApproveLoader, tokenIndex] = useMemo(() => {
    for (let index = 0; index < approvalStates.length; index++) {
      const approvalState = approvalStates[index]
      const amountIn = amountInArray[index]

      if (approvalState !== ApprovalState.APPROVED && !!amountIn)
        return [true, approvalState === ApprovalState.PENDING, index]
    }
    return [false, false, -1]
  }, [approvalStates, amountInArray])

  const insufficientBalance = useMemo(() => {
    for (let index = 0; index < inputTokens[selected].length; index++) {
      const amountIn = tryParseAmount(amountInArray[index], inputTokens[selected][index] || undefined)
      const balance = currencyBalances[index]
      if (amountIn && balance && balance.lessThan(amountIn)) return true
    }
    return false
  }, [inputTokens, selected, amountInArray, account])

  const handleApprove = async (index: number) => {
    setAwaitingApproveConfirmation(true)
    await handleApproveByIndex(index)
    setAwaitingApproveConfirmation(false)
  }

  const handleLiquidity = useCallback(async () => {
    console.log('called handleLiquidity')
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
  }, [liquidityCallback])

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
    if (showApproveLoader) {
      return (
        <DepositButton active>
          Approving <DotFlashing style={{ marginLeft: '10px' }} />
        </DepositButton>
      )
    }
    if (showApprove) {
      return (
        <DepositButton onClick={() => handleApprove(tokenIndex)}>
          Allow us to spend {inputTokens[selected][tokenIndex]?.symbol}
        </DepositButton>
      )
    }
    return null
  }

  function getActionButton(type: string): JSX.Element | null {
    if (!chainId || !account || !type) {
      return <DepositButton onClick={toggleWalletModal}>Connect Wallet</DepositButton>
    }
    if (showApprove) return null

    if (insufficientBalance) {
      return <DepositButton disabled>Insufficient {inputTokens[selected][tokenIndex]?.symbol} Balance</DepositButton>
    }

    if (awaitingLiquidityConfirmation) {
      return (
        <DepositButton>
          {type === 'add' ? 'Depositing' : 'Withdrawing'}
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
          <Wrapper>
            {inputTokens[selected].map((token, index) => {
              return (
                <InputBox
                  key={index}
                  currency={token}
                  value={amountInArray[index]}
                  onChange={(value: string) => {
                    type MyType = typeof amountInArray
                    const newArray: MyType = [...amountInArray]
                    newArray[index] = value
                    setAmountInArray([...newArray])
                  }}
                  title={'From'}
                />
              )
            })}

            <ArrowDown style={{ cursor: 'pointer' }} />
            <InputBox
              currency={deiCurrency}
              value={amountOut[0]?.toString()}
              onChange={() => console.debug('')}
              title={'To'}
              disabled
            />
            <div style={{ marginTop: '20px' }}></div>
            <InputBox
              currency={bdeiCurrency}
              value={amountOut[1]?.toString()}
              onChange={() => console.debug('')}
              title={'To'}
              disabled
            />
            <div style={{ marginTop: '20px' }}></div>
            {getApproveButton('remove')}
            {getActionButton('remove')}
          </Wrapper>
        </>
      )
    } else {
      return (
        <>
          <Wrapper>
            {inputTokens[selected].map((token, index) => {
              return (
                <div style={{ width: '100%' }} key={index}>
                  <InputBox
                    currency={token}
                    value={amountInArray[index]}
                    onChange={(value: string) => {
                      type MyType = typeof amountInArray
                      const newArray: MyType = [...amountInArray]
                      newArray[index] = value
                      setAmountInArray([...newArray])
                    }}
                    title={'From'}
                  />
                  <div style={{ marginTop: '20px' }}></div>
                </div>
              )
            })}

            <div style={{ marginTop: '20px' }}></div>
            {getApproveButton('add')}
            {getActionButton('add')}
          </Wrapper>
        </>
      )
    }
  }

  return (
    <Container>
      <Hero>
        <div>Liquidity Pool</div>
      </Hero>
      <TopWrapper>
        <LiquidityWrapper>
          <ToggleState>
            <ActionSetter selected={selected} setSelected={setSelected} />
          </ToggleState>

          {getAppComponent()}
          <AdvancedOptions slippage={slippage} setSlippage={setSlippage} />
        </LiquidityWrapper>

        <FarmWrapper>
          <Staking pool={StakingPools[1]} />
        </FarmWrapper>
      </TopWrapper>
      <Disclaimer />
    </Container>
  )
}
