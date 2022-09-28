import styled from 'styled-components'
import { Currency } from '@sushiswap/core-sdk'

import { Modal, ModalHeader } from 'components/Modal'
import { SearchField, useSearch } from 'components/App/Swap/Search'
import TokenBox from 'components/App/Swap/TokenBox'
import Column from 'components/Column'

const Wrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  gap: 0.8rem;
  padding: 1.5rem 0;
  overflow-y: auto;

  & > * {
    &:first-child {
      width: unset;
      margin: 0 1rem;
    }
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 1rem;
  `};
`

const TokenResultWrapper = styled(Column)`
  gap: 8px;
  border-top: 1px solid ${({ theme }) => theme.border1};
  /* margin: 5px; */
  padding: 8px;
  padding-top: 1rem;
`

export default function TokensModal({
  isOpen,
  toggleModal,
  tokens,
}: {
  isOpen: boolean
  toggleModal: (action: boolean) => void
  tokens: Currency[]
}) {
  const { snapshot, searchProps } = useSearch(tokens)
  const result = snapshot.options.map((token) => token)

  return (
    <Modal isOpen={isOpen} onBackgroundClick={() => toggleModal(false)} onEscapeKeydown={() => toggleModal(false)}>
      <ModalHeader onClose={() => toggleModal(false)} title="Select a Token" />
      <Wrapper>
        <SearchField searchProps={searchProps} />
        <TokenResultWrapper>
          {result.map((token, index) => (
            <TokenBox key={index} toggleModal={toggleModal} currency={token as unknown as Currency} />
          ))}
        </TokenResultWrapper>
      </Wrapper>
    </Modal>
  )
}
