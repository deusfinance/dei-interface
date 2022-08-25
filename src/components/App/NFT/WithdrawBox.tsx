import React, { useState, useCallback, useEffect } from 'react'
import styled from 'styled-components'
import { toast } from 'react-hot-toast'
import { useTransactionAdder } from 'state/transactions/hooks'

import { PrimaryButton } from 'components/Button'
import { Row, RowBetween } from 'components/Row'
import Column from 'components/Column'
import { NumericalInput } from 'components/Input'
import { DotFlashing } from 'components/Icons'
import { useWalletModalToggle } from 'state/application/hooks'
import useWeb3React from 'hooks/useWeb3'
import { useStakedVDeusStats } from 'hooks/useVDeusStats'
import { useVDeusStakingContract } from 'hooks/useContract'
import { useSupportedChainId } from 'hooks/useSupportedChainId'
import { DefaultHandlerError } from 'utils/parseError'
import DefaultReviewModal from 'components/ReviewModal/DefaultReviewModal'

const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  overflow: visible;
  margin: 0 auto;
`

const WithdrawWrap = styled(Container)`
  width: 98%;
  border: ${({ theme }) => `2px solid ${theme.bg2}`};
  margin: 50px 10px 0 10px;
  padding: 20px;
  border-radius: 15px;
  background: ${({ theme }) => theme.bg0};

  ${({ theme }) => theme.mediaWidth.upToMedium`
    display: flex;
    justify-content: center;
    flex-direction: column;
    width: 95%;
  `};
`

const WithdrawTitleSpan = styled(Row)`
  font-family: 'IBM Plex Mono';
  font-size: 16px;
  line-height: 21px;
  margin-bottom: 0.75rem;
`

const VoucherText = styled.span<{ active?: boolean }>`
  margin-right: 12px;
  color: ${({ theme }) => theme.text2};

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    display: block;
  `}

  ${({ active }) =>
    active &&
    `
    background: -webkit-linear-gradient(90deg, #0badf4 0%, #30efe4 93.4%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  `};
`

const BoxesRow = styled.div`
  display: flex;
  flex-direction: row;
  padding-top: 20px;
  margin-left: auto;
  margin-right: 0;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    margin: 0 auto;
  `}
  & > * {
    margin: 4px;
  }
`

const NFTCountWrapper = styled.div`
  background: ${({ theme }) => theme.bg2};
  width: 280px;
  border: 1px solid #444444;
  border-radius: 12px;
  padding: 0.5rem;
  font-size: 10px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    width: 220px;
  `}
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    width: fit-content;
  `}
`

const MainButton = styled(PrimaryButton)`
  width: 280px;
  height: 68px;
  border-radius: 12px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    width: 220px;
  `}
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    width: fit-content;
  `}
`

const SelectAllWrap = styled.div`
  cursor: pointer;
  font-weight: 400;
  font-size: 12px;
  color: #ffffff;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    display: none;
  `}
`

const NFTsWrap = styled(Column)`
  padding-top: 10px;
`

export default function WithdrawBox() {
  const { chainId, account } = useWeb3React()
  const toggleWalletModal = useWalletModalToggle()
  const { numberOfStakedVouchers, listOfStakedVouchers } = useStakedVDeusStats()
  const [NFTCount, setNFTCount] = useState(0)
  const [initialSet, setInitialSet] = useState(false)
  const [hasInformed, setHasInformed] = useState(false)
  const [awaitingWithdrawConfirmation, setAwaitingWithdrawConfirmation] = useState(false)
  const [isOpenReviewModal, toggleReviewModal] = useState(false)
  const stakingContract = useVDeusStakingContract()
  const isSupportedChainId = useSupportedChainId()
  const addTransaction = useTransactionAdder()

  useEffect(() => {
    if (NFTCount === 0 && !initialSet && numberOfStakedVouchers) {
      setInitialSet(true)
      setNFTCount(numberOfStakedVouchers)
    } else if (NFTCount > numberOfStakedVouchers) setNFTCount(numberOfStakedVouchers)
  }, [NFTCount, initialSet, numberOfStakedVouchers])

  const onWithdrawAllDeposit = useCallback(async () => {
    try {
      if (!stakingContract || !account || !isSupportedChainId || !NFTCount) return
      if (NFTCount > 10 && !hasInformed) {
        toggleReviewModal(true)
        setHasInformed(true)
        return
      }
      setAwaitingWithdrawConfirmation(true)
      const response = await stakingContract.withdrawAll(NFTCount, account)
      addTransaction(response, { summary: `Withdraw All` })
      setAwaitingWithdrawConfirmation(false)
      // setPendingTxHash(response.hash)
    } catch (err) {
      console.log(err)
      toast.error(DefaultHandlerError(err))
      setAwaitingWithdrawConfirmation(false)
      // setPendingTxHash('')
    }
  }, [stakingContract, account, isSupportedChainId, NFTCount, hasInformed, addTransaction])

  function getActionButton(): JSX.Element | null {
    if (!chainId || !account) {
      return <MainButton onClick={toggleWalletModal}>Connect Wallet</MainButton>
    } else if (awaitingWithdrawConfirmation) {
      return (
        <MainButton>
          Withdrawing NFT{NFTCount > 1 ? 's' : ''} <DotFlashing style={{ marginLeft: '10px' }} />
        </MainButton>
      )
    }
    return <MainButton onClick={() => onWithdrawAllDeposit()}>Withdraw NFT{NFTCount > 1 ? 's' : ''}</MainButton>
  }

  return (
    <WithdrawWrap>
      <WithdrawTitleSpan>You can Withdraw your vDEUS NFTs in this order:</WithdrawTitleSpan>
      {numberOfStakedVouchers ? (
        <div>
          {listOfStakedVouchers.map((voucher, index) => (
            <VoucherText active={index < NFTCount} key={index}>
              {index + 1}.vDEUS #{voucher}
            </VoucherText>
          ))}
        </div>
      ) : (
        <VoucherText active={true}>No staked NFT found!</VoucherText>
      )}
      <Row>
        <BoxesRow>
          <NFTCountWrapper>
            <RowBetween>
              <p>vDEUS NFT Count:</p>
              <SelectAllWrap onClick={() => setNFTCount(numberOfStakedVouchers)}>
                Select All {numberOfStakedVouchers}
              </SelectAllWrap>
            </RowBetween>
            <NFTsWrap>
              <NumericalInput
                value={NFTCount || ''}
                onUserInput={(value: string) => setNFTCount(Number(value))}
                placeholder="Enter NFT count"
                autoFocus
                style={{ textAlign: 'left', height: '50px', fontSize: '1rem' }}
              />
            </NFTsWrap>
          </NFTCountWrapper>
          {getActionButton()}
        </BoxesRow>
      </Row>
      <DefaultReviewModal
        title={'Warning'}
        isOpen={isOpenReviewModal}
        toggleModal={(action: boolean) => toggleReviewModal(action)}
        summary={[
          'This transaction is expected to fail',
          "This transaction will most likely fail because it will run out of gas, please select less NFTs to withdraw. But if you insist, you can proceed by clicking again on 'Withdraw NFTs' button",
        ]}
      />
    </WithdrawWrap>
  )
}
