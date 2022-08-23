import styled from 'styled-components'

import { Modal, ModalHeader } from 'components/Modal'
import Column from 'components/Column'
import { RowBetween, RowCenter } from 'components/Row'
import { SearchField, useSearch } from 'components/App/NFT3/Search'
import NFTBox from './NFTBox'
import { useState } from 'react'
import { PrimaryButton } from 'components/Button'
import { VDEUS_NFT } from 'hooks/useVDeusNfts'

const Wrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  padding: 16px 12px;
  max-height: 400px;
  overflow-y: auto;
  & > * {
    &:first-child {
      width: unset;
      margin: 0 9px;
      min-height: 54px;
      margin-bottom: 12px;
    }
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 1rem;
  `};
`

const NotFoundWrapper = styled(RowBetween).attrs({
  align: 'center',
})`
  border-radius: 15px;
  color: ${({ theme }) => theme.text2};
  white-space: nowrap;
  height: 64px;
  gap: 10px;
  padding: 0px 1rem;
  margin: 0 auto;
  border: 1px solid ${({ theme }) => theme.border2};
  background: ${({ theme }) => theme.bg1};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 0.5rem;
  `}
`

const Text = styled(RowCenter)`
  padding-right: 30px;
`

const TokenResultWrapper = styled(Column)`
  gap: 8px;
  padding: 1rem 9px;
  padding-bottom: 0;
  overflow-y: auto;
`

const SelectAllWrap = styled(RowBetween)`
  cursor: pointer;
  font-weight: 400;
  font-size: 12px;

  color: #ffffff;
`

const DoneButton = styled(PrimaryButton)`
  border-radius: 15px;
`

const Separator = styled.div`
  width: 420px;
  height: 1px;
  margin-left: -17px;
  background: ${({ theme }) => theme.border2};
`

export default function NFTsModal({
  isOpen,
  toggleModal,
  selectedNFT,
  setNFTs,
}: {
  isOpen: boolean
  toggleModal: (action: boolean) => void
  selectedNFT: VDEUS_NFT[]
  setNFTs: (tokenIds: VDEUS_NFT[]) => void
}) {
  const [selectedNFTs, setSelectedNFTs] = useState<VDEUS_NFT[]>([])
  const { snapshot, searchProps } = useSearch()
  const result = snapshot.options.map((nft) => nft)

  function setVDeusNfts(nft: VDEUS_NFT) {
    const index = selectedNFTs.findIndex((element) => element.tokenId === nft.tokenId)
    console.log([...selectedNFTs, nft])
    if (index === -1) setSelectedNFTs([...selectedNFTs, nft])
    else {
      const nfts: VDEUS_NFT[] = []
      selectedNFTs.forEach((selectNft) => {
        if (selectNft.tokenId === nft.tokenId) return
        nfts.push(selectNft)
      })
      setSelectedNFTs(nfts)
    }
  }

  function onSelectAll() {
    const nfts: VDEUS_NFT[] = []
    result.forEach((nft) => nfts.push({ value: +nft.value, tokenId: +nft.name }))
    setSelectedNFTs(nfts)
  }

  function onExit() {
    toggleModal(false)
    setNFTs(selectedNFTs)
  }

  return (
    <Modal isOpen={isOpen} onBackgroundClick={onExit} onEscapeKeydown={onExit}>
      <ModalHeader onClose={onExit} title="Select a NFT" />
      <Wrapper>
        <SearchField searchProps={searchProps} />
        <Separator />

        <TokenResultWrapper>
          {result.length ? (
            <>
              <SelectAllWrap onClick={onSelectAll}>
                <p>Select NFTs for Migration</p>
                <p>Select All</p>
              </SelectAllWrap>
              {result.map((nft: any, index) => {
                return (
                  <NFTBox
                    key={index}
                    toggleModal={toggleModal}
                    nft={{ tokenId: nft?.tokenId, value: nft?.value }}
                    setNFT={(token: VDEUS_NFT) => setVDeusNfts(token)}
                    disabled={selectedNFTs.findIndex((element) => element.tokenId === nft?.tokenId) > -1 ? true : false}
                  />
                )
              })}
              <DoneButton onClick={onExit}>Done</DoneButton>
            </>
          ) : (
            <NotFoundWrapper>
              <Text>NFT Not FOUND</Text>
            </NotFoundWrapper>
          )}
        </TokenResultWrapper>
      </Wrapper>
    </Modal>
  )
}
