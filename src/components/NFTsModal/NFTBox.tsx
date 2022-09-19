import React from 'react'
import styled from 'styled-components'

import { RowBetween } from 'components/Row'
import { formatBalance } from 'utils/numbers'
import { lighten } from 'polished'
import { VDEUS_NFT } from 'hooks/useVDeusNfts'

const Wrapper = styled(RowBetween).attrs({
  align: 'center',
})<{ active?: boolean }>`
  border-radius: 15px;
  white-space: nowrap;
  min-height: 60px;
  gap: 10px;
  padding: 0px 1rem;
  margin: 0 auto;
  color: ${({ theme }) => theme.text2};
  border: 1px solid ${({ theme, active }) => (active ? theme.text3 : theme.border2)};
  background: ${({ theme, active }) => (active ? lighten(0.2, theme.bg1) : theme.bg1)};
  &:hover {
    background: ${({ theme }) => lighten(0.2, theme.bg1)};
    cursor: pointer;
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 0.5rem;
  `}
`

export const Balance = styled.div<{ active?: boolean }>`
  font-size: 12px;
  margin-top: 6px;
  color: ${({ theme, active }) => (active ? theme.text2 : theme.text1)};
`

export const TokenIdWrap = styled.div`
  display: block;
  margin-left: 8px;
  font-size: 1rem;
  color: ${({ theme }) => theme.text1};
  font-size: 16px;
`

export const TokenId = styled.p`
  font-size: 1rem;
  background: ${({ theme }) => theme.deusColor};
  font-size: 16px;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`

export default function NFTBox({
  nft,
  toggleModal,
  setNFT,
  disabled,
}: {
  nft: VDEUS_NFT
  toggleModal: (action: boolean) => void
  setNFT: (tokenId: VDEUS_NFT) => void
  disabled?: boolean
}) {
  const balanceDisplay = nft.value ? formatBalance(nft.value * 250) : null

  // console.log({ balanceDisplay })

  return (
    <Wrapper
      onClick={() => {
        if (nft.value !== 0) setNFT(nft)
      }}
      active={disabled}
    >
      <TokenIdWrap>
        <TokenId>vDEUS #{nft.tokenId}</TokenId>
        <Balance>{balanceDisplay ? `Value: $${balanceDisplay} in vDEUS` : 'New NFTs are not considered yet'}</Balance>
      </TokenIdWrap>
    </Wrapper>
  )
}
