import React, { useState, useRef } from 'react'
import { useRouter } from 'next/router'
import styled from 'styled-components'
import Image from 'next/image'
import Link from 'next/link'
import { Z_INDEX } from 'theme'

import useOnOutsideClick from 'hooks/useOnOutsideClick'
import DeiLogo from '/public/static/images/tokens/newDei.svg'

import {
  NavToggle,
  IconWrapper,
  Swap as SwapIcon,
  Borrow as BorrowIcon,
  Staking as StakingIcon,
  Dashboard as DashboardIcon,
  Migration as MigrationIcon,
} from 'components/Icons'

import { Card } from 'components/Card'
import { NavButton } from 'components/Button'
import { ExternalLink } from 'components/Link'
import { ArrowUpRight } from 'react-feather'

const Container = styled.div`
  overflow: hidden;
  display: flex;
  flex-flow: row nowrap;
  align-items: flex-end;
`

const InlineModal = styled(Card)<{
  isOpen: boolean
}>`
  display: ${(props) => (props.isOpen ? 'flex' : 'none')};
  position: absolute;
  width: 220px;
  transform: translateX(-220px) translateY(15px);
  z-index: ${Z_INDEX.modal};
  gap: 10px;
  padding: 0.8rem;
  border: 1px solid ${({ theme }) => theme.border2};
  border-radius: 10px;
`

const Row = styled.div<{
  active?: boolean
}>`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  color: ${({ theme }) => theme.text1};
  &:hover {
    cursor: pointer;
    color: ${({ theme }) => theme.text2};
  }

  ${({ active, theme }) =>
    active &&
    ` color: ${theme.text2};
      pointer-events: none;
  `};
`

const Separator = styled.div`
  width: 225px;
  margin-left: -13px;
  height: 1px;
  background: ${({ theme }) => theme.bg4};
`

// TODO ADD PROPER ICONS
export default function Menu() {
  const ref = useRef(null)
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const toggle = () => setIsOpen((prev) => !prev)
  useOnOutsideClick(ref, () => setIsOpen(false))

  return (
    <Container ref={ref}>
      <NavButton onClick={() => toggle()}>
        <NavToggle />
      </NavButton>
      <div>
        <InlineModal isOpen={isOpen}>
          <Link href="/dashboard" passHref>
            <Row active={router.route === '/dashboard'}>
              <div>Dashboard</div>
              <IconWrapper>
                <DashboardIcon size={20} />
              </IconWrapper>
            </Row>
          </Link>
          <Link href="/swap" passHref>
            <Row active={router.route === '/swap'}>
              <div>Swap</div>
              <IconWrapper>
                <SwapIcon size={20} />
              </IconWrapper>
            </Row>
          </Link>
          <Link href="/migration" passHref>
            <Row active={router.route === '/migration'}>
              <div>Migration</div>
              <IconWrapper>
                <MigrationIcon size={20} />
              </IconWrapper>
            </Row>
          </Link>
          <Link href="/staking" passHref>
            <Row active={router.route === '/staking'}>
              <div>Staking</div>
              <IconWrapper>
                <StakingIcon />
              </IconWrapper>
            </Row>
          </Link>
          <Link href="/borrow" passHref>
            <Row active={router.route === 'borrow'}>
              <div>Borrow</div>
              <IconWrapper>
                <BorrowIcon />
              </IconWrapper>
            </Row>
          </Link>
          <ExternalLink href="https://docs.deus.finance/contracts/disclaimer">
            <Row onClick={() => toggle()}>
              <div>Terms</div>
            </Row>
          </ExternalLink>
          <Separator />

          <ExternalLink href="https://github.com/deusfinance">
            <Row onClick={() => toggle()}>
              <div>
                New App
                <ArrowUpRight size={'15px'} style={{ marginLeft: '15px', marginTop: '5px' }} />
              </div>
              <IconWrapper>
                <Image src={DeiLogo} alt="DEI Logo" height="16px" width="20px" />
              </IconWrapper>
            </Row>
          </ExternalLink>
        </InlineModal>
      </div>
    </Container>
  )
}
