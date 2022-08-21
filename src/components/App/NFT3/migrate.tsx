import React, { useState, useMemo, useCallback } from 'react'
import styled from 'styled-components'
import { darken } from 'polished'
import { ArrowDown } from 'react-feather'

import { useWalletModalToggle } from 'state/application/hooks'
import useWeb3React from 'hooks/useWeb3'
import useDebounce from 'hooks/useDebounce'
import { useSupportedChainId } from 'hooks/useSupportedChainId'
import useApproveCallback, { ApprovalState } from 'hooks/useApproveCallback'
import useBondsCallback from 'hooks/useBondsCallback'
import { useBondsAmountsOut } from 'hooks/useBondsPage'
import { tryParseAmount } from 'utils/parse'

import { PrimaryButton } from 'components/Button'
import { DotFlashing } from 'components/Icons'

import InputBox from 'components/App/Redemption/InputBox'
import { DeiBonder } from 'constants/addresses'
import { DEI_TOKEN, VDEUS_TOKEN } from 'constants/tokens'
import { NavigationTypes } from 'components/StableCoin'
import NFTsModal from 'components/NFTsModal'
import SelectBox from 'components/SelectBox'
import { Balance, TokenId } from 'components/NFTsModal/NFTBox'
import { VDEUS_NFT } from 'hooks/useVDeusNfts'

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

const RedeemButton = styled(PrimaryButton)`
  border-radius: 15px;
`
const NFTWrap = styled.div`
  display: block;
  margin-left: 16px;
`

export default function Migrate({ onSwitch }: { onSwitch: any }) {
  const { chainId, account } = useWeb3React()
  const toggleWalletModal = useWalletModalToggle()
  const isSupportedChainId = useSupportedChainId()
  const [amountIn, setAmountIn] = useState('')
  const debouncedAmountIn = useDebounce(amountIn, 500)
  const deiCurrency = DEI_TOKEN
  const vDEUSCurrency = VDEUS_TOKEN

  const [isOpenNFTsModal, toggleNFTsModal] = useState(false)
  const [inputNFT, setInputNFT] = useState<VDEUS_NFT[]>([])

  const { amountOut } = useBondsAmountsOut(debouncedAmountIn)
  const deiAmount = useMemo(() => {
    return tryParseAmount(amountIn, deiCurrency || undefined)
  }, [amountIn, deiCurrency])

  // const insufficientBalance = useMemo(() => {
  //   if (!deiAmount) return false
  //   return deiCurrencyBalance?.lessThan(deiAmount)
  // }, [deiCurrencyBalance, deiAmount])

  const {
    state: redeemCallbackState,
    callback: redeemCallback,
    error: redeemCallbackError,
  } = useBondsCallback(deiCurrency, deiAmount)

  const [awaitingApproveConfirmation, setAwaitingApproveConfirmation] = useState<boolean>(false)
  const [awaitingRedeemConfirmation, setAwaitingRedeemConfirmation] = useState<boolean>(false)
  const spender = useMemo(() => (chainId ? DeiBonder[chainId] : undefined), [chainId])
  const [approvalState, approveCallback] = useApproveCallback(deiCurrency ?? undefined, spender)
  const [showApprove, showApproveLoader] = useMemo(() => {
    const show = deiCurrency && approvalState !== ApprovalState.APPROVED && !!amountIn
    return [show, show && approvalState === ApprovalState.PENDING]
  }, [deiCurrency, approvalState, amountIn])

  const handleApprove = async () => {
    setAwaitingApproveConfirmation(true)
    await approveCallback()
    setAwaitingApproveConfirmation(false)
  }

  const handleMint = useCallback(async () => {
    console.log('called handleMint')
    console.log(redeemCallbackState, redeemCallback, redeemCallbackError)
    if (!redeemCallback) return

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
    // if (bondingPaused) {
    //   return <RedeemButton disabled>Mint Paused</RedeemButton>
    // }
    // if (insufficientBalance) {
    //   return <RedeemButton disabled>Insufficient {deiCurrency?.symbol} Balance</RedeemButton>
    // }
    if (awaitingRedeemConfirmation) {
      return (
        <RedeemButton>
          Migrating to ERC20 <DotFlashing style={{ marginLeft: '10px' }} />
        </RedeemButton>
      )
    }
    return <RedeemButton onClick={() => handleMint()}>Migrate to ERC20</RedeemButton>
  }
  function getCurrentItem() {
    let totalValue = 0
    let vDEUSText = ''

    return inputNFT.length ? (
      <NFTWrap>
        <TokenId>vDEUS #{inputNFT[0].tokenId}</TokenId>
        <Balance>{true ? `NFT Value: ${2} vDEUS` : `Total NFT Value ${2} vDEUS`}</Balance>
      </NFTWrap>
    ) : null
  }

  return (
    <>
      <Wrapper>
        <SelectBox
          value={inputNFT.length ? `vDEUS #${inputNFT[0].tokenId}` : ''}
          placeholder="Select vDEUS NFT"
          currentItem={getCurrentItem()}
          onSelect={() => toggleNFTsModal(true)}
        />
        <ArrowDown style={{ cursor: 'pointer' }} onClick={() => onSwitch(NavigationTypes.SWAP)} />

        <InputBox
          currency={vDEUSCurrency}
          value={amountOut}
          onChange={(value: string) => console.log(value)}
          title={'To'}
          disabled={true}
        />
        <div style={{ marginTop: '20px' }}></div>
        {getApproveButton()}
        {getActionButton()}
      </Wrapper>
      <NFTsModal
        isOpen={isOpenNFTsModal}
        toggleModal={(action: boolean) => toggleNFTsModal(action)}
        selectedNFT={inputNFT}
        setNFTs={setInputNFT}
      />
    </>
  )
}
