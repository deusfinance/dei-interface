import React, { useState, useMemo, useEffect, useCallback } from 'react'
import styled from 'styled-components'
import { ArrowDown } from 'react-feather'

import { formatBalance } from 'utils/numbers'
import { useWalletModalToggle } from 'state/application/hooks'
import useWeb3React from 'hooks/useWeb3'
import { useOwnedVDeusNfts, VDEUS_NFT } from 'hooks/useVDeusNfts'
import { useERC721ApproveAllCallback, ApprovalState } from 'hooks/useApproveNftCallback2'
import useVDeusMigrationCallback from 'hooks/useVDeusMigrationCallback'
import { useSupportedChainId } from 'hooks/useSupportedChainId'

import { PrimaryButton } from 'components/Button'
import { DotFlashing } from 'components/Icons'
import InputBox from 'components/App/Redemption/InputBox'
import { vDeus, Migrator } from 'constants/addresses'
import { VDEUS_TOKEN } from 'constants/tokens'
import NFTsModal from 'components/NFTsModal'
import SelectBox from 'components/SelectBox'
import { Balance, TokenId } from 'components/NFTsModal/NFTBox'
import { RowStart } from 'components/Row'

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

const NFTWrap = styled.div`
  margin-left: 16px;
  color: ${({ theme }) => theme.text1};
`

const Description = styled.div`
  font-size: 0.85rem;
  line-height: 1.25rem;
  margin-top: 15px;
  margin-left: 10px;
  color: ${({ theme }) => theme.warning};
`

export default function Migrate() {
  const { chainId, account } = useWeb3React()
  const toggleWalletModal = useWalletModalToggle()
  const isSupportedChainId = useSupportedChainId()
  const vDEUSCurrency = VDEUS_TOKEN

  const userNFTs = useOwnedVDeusNfts()
  const [isOpenNFTsModal, toggleNFTsModal] = useState(false)
  const [inputNFT, setInputNFT] = useState<VDEUS_NFT[]>([])

  const [amountOut, setAmountOut] = useState('')

  const tokenIds = useMemo(() => {
    if (!inputNFT) return []
    return inputNFT.map((nft) => nft.tokenId)
  }, [inputNFT])

  useEffect(() => {
    let totalValue = 0
    inputNFT.forEach((nft) => {
      totalValue += nft.value
    })
    setAmountOut(totalValue ? formatBalance(totalValue) : '')
  }, [inputNFT])

  const { callback: migrationCallback } = useVDeusMigrationCallback(tokenIds)

  const [awaitingApproveConfirmation, setAwaitingApproveConfirmation] = useState<boolean>(false)
  const [awaitingRedeemConfirmation, setAwaitingRedeemConfirmation] = useState<boolean>(false)
  const spender = useMemo(() => (chainId ? Migrator[chainId] : undefined), [chainId])

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

  function getApproveButton(): JSX.Element | null {
    if (!isSupportedChainId || !account) {
      return null
    } else if (awaitingApproveConfirmation) {
      return (
        <MainButton active>
          Awaiting Confirmation <DotFlashing style={{ marginLeft: '10px' }} />
        </MainButton>
      )
    } else if (showApprove) {
      return <MainButton onClick={handleApprove}>Approve vDEUS NFT</MainButton>
    }
    return null
  }

  function getActionButton(): JSX.Element | null {
    if (!chainId || !account) {
      return <MainButton onClick={toggleWalletModal}>Connect Wallet</MainButton>
    } else if (showApprove) {
      return null
    } else if (awaitingRedeemConfirmation) {
      return (
        <MainButton>
          Migrating to ERC20 <DotFlashing style={{ marginLeft: '10px' }} />
        </MainButton>
      )
    }
    return <MainButton onClick={() => handleMigrate()}>Migrate to ERC20</MainButton>
  }

  const getCurrentItem = useCallback(() => {
    const isSelectAll = userNFTs.length === tokenIds.length

    return tokenIds.length ? (
      <NFTWrap>
        <>
          {isSelectAll ? (
            <RowStart width={'100%'} style={{ gap: '6px' }}>
              All <TokenId>{tokenIds.length} vDEUS</TokenId> NFTs are selected
            </RowStart>
          ) : (
            <TokenId> {'vDEUS ' + `#${tokenIds.join(',#')}`}</TokenId>
          )}
          <Balance>Total NFTs Value: ${formatBalance(parseFloat(amountOut) * 250)} in vDEUS</Balance>
        </>
      </NFTWrap>
    ) : null
  }, [tokenIds, userNFTs, amountOut])

  return (
    <>
      <Wrapper>
        <SelectBox
          value={inputNFT.length ? `vDEUS #${inputNFT[0].tokenId}` : ''}
          placeholder="Select vDEUS NFT"
          currentItem={getCurrentItem()}
          onSelect={() => toggleNFTsModal(true)}
        />
        <ArrowDown />

        <InputBox
          currency={vDEUSCurrency}
          value={amountOut}
          onChange={(value: string) => console.log(value)}
          title={'To (ERC20)'}
          disabled={true}
        />
        <div style={{ marginTop: '20px' }}></div>
        {getApproveButton()}
        {getActionButton()}
        {inputNFT.length > 10 && !showApprove && (
          <Description>
            This transaction will most likely fail because it will run out of gas, please select less NFTs to migrate.
          </Description>
        )}
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
