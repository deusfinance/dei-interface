import React from 'react'
import styled from 'styled-components'

import { Modal, ModalHeader } from 'components/Modal'
import { ConfirmationAnimation } from 'components/Icons'

const ModalInnerWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  gap: 30px;
  padding: 2rem;
`

export default function MaintenanceModal({ content }: { content: string }) {
  return (
    <Modal isOpen={true} onBackgroundClick={() => null} onEscapeKeydown={() => null}>
      <ModalHeader title="Under Maintenance" border={true} onClose={() => null} hideClose />
      <ModalInnerWrapper>
        <ConfirmationAnimation size="80px" />
        {content}
      </ModalInnerWrapper>
    </Modal>
  )
}
