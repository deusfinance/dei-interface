import React, { useState, useMemo, useCallback } from 'react'
import styled from 'styled-components'

import Hero, { HeroSubtext } from 'components/Hero'
import Disclaimer from 'components/Disclaimer'

import { ArrowDown } from 'react-feather'
import { useWalletModalToggle } from 'state/application/hooks'
import useWeb3React from 'hooks/useWeb3'
import { VDEUS_NFT } from 'hooks/useVDeusNfts'
import { useERC721ApproveAllCallback, ApprovalState } from 'hooks/useApproveNftCallback'
import useVDeusMigrationCallback from 'hooks/useVDeusMigrationCallback'
import { useSupportedChainId } from 'hooks/useSupportedChainId'

import { PrimaryButton } from 'components/Button'
import { DotFlashing } from 'components/Icons'
import InputBox from 'components/App/Redemption/InputBox'
import { vDeus, Migrator } from 'constants/addresses'
import { BDEI_TOKEN, DEI_TOKEN, VDEUS_TOKEN } from 'constants/tokens'
import { useExpiredPrice } from 'state/dashboard/hooks'
import useUpdateCallback from 'hooks/useOracleCallback'
import TokensModal from 'components/App/Swap/TokensModal'
import { Currency } from '@sushiswap/core-sdk'

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
  margin-top: 15px;
  margin-left: 10px;
  color: ${({ theme }) => theme.warning};
`

export default function Migrator2() {
  const { chainId, account } = useWeb3React()
  const toggleWalletModal = useWalletModalToggle()
  const isSupportedChainId = useSupportedChainId()
  const bDEICurrency = BDEI_TOKEN
  const DEICurrency = DEI_TOKEN
  const vDEUSCurrency = VDEUS_TOKEN

  const expiredPrice = useExpiredPrice()

  const [inputNFT, setInputNFT] = useState<VDEUS_NFT[]>([])
  const [inputCurrency, setInputCurrency] = useState<Currency>(DEICurrency)

  const [amountOut, setAmountOut] = useState('')

  const tokenIds = useMemo(() => {
    if (!inputNFT) return []
    return inputNFT.map((nft) => nft.tokenId)
  }, [inputNFT])

  const { callback: migrationCallback } = useVDeusMigrationCallback(tokenIds)
  const { callback: updateOracleCallback } = useUpdateCallback()

  const [awaitingApproveConfirmation, setAwaitingApproveConfirmation] = useState(false)
  const [awaitingRedeemConfirmation, setAwaitingRedeemConfirmation] = useState(false)
  const [awaitingUpdateConfirmation, setAwaitingUpdateConfirmation] = useState(false)
  const spender = useMemo(() => (chainId ? Migrator[chainId] : undefined), [chainId])

  const [isOpenTokensModal, toggleTokensModal] = useState(false)

  const [approvalState, approveCallback] = useERC721ApproveAllCallback(chainId ? vDeus[chainId] : undefined, spender)
  const showApprove = useMemo(() => approvalState !== ApprovalState.APPROVED, [approvalState])

  const handleApprove = async () => {
    setAwaitingApproveConfirmation(true)
    await approveCallback()
    setAwaitingApproveConfirmation(false)
  }

  const handleMigrate = useCallback(async () => {
    console.log('called handleMigrate')
    if (!migrationCallback) return
    try {
      setAwaitingRedeemConfirmation(true)
      const txHash = await migrationCallback()
      setAwaitingRedeemConfirmation(false)
      console.log({ txHash })
      setInputNFT([])
      setAmountOut('')
    } catch (e) {
      setAwaitingRedeemConfirmation(false)
      setInputNFT([])
      setAmountOut('')
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
      return <MainButton onClick={handleApprove}>Approve vDEUS NFT</MainButton>
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

    if (awaitingRedeemConfirmation) {
      return (
        <MainButton>
          Migrating to {bDEICurrency.symbol} <DotFlashing />
        </MainButton>
      )
    }
    return <MainButton onClick={() => handleMigrate()}>Migrate to {bDEICurrency.symbol}</MainButton>
  }

  return (
    <Container>
      <Hero>
        <div>bDEI Migrator</div>
        <HeroSubtext>Migrate your DEI/vDEUS to bDEI</HeroSubtext>
      </Hero>
      <Wrapper>
        <InputBox
          currency={inputCurrency}
          value={amountOut}
          onChange={(value: string) => console.log(value)}
          title={'From'}
          onTokenSelect={() => {
            toggleTokensModal(true)
          }}
        />
        <ArrowDown />

        <InputBox
          currency={bDEICurrency}
          value={amountOut}
          onChange={(value: string) => console.log(value)}
          title={'To'}
          disabled={true}
        />
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
