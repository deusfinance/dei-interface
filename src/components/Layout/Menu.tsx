import React, { useState, useRef } from 'react'
import { useRouter } from 'next/router'
import styled from 'styled-components'
import Link from 'next/link'

import useOnOutsideClick from 'hooks/useOnOutsideClick'
import { Z_INDEX } from 'theme'
import { useDarkModeManager } from 'state/user/hooks'

import {
  ThemeToggle,
  NavToggle,
  IconWrapper,
  Telegram as TelegramIcon,
  Trade as TradeIcon,
  Twitter as TwitterIcon,
  Github as GithubIcon,
} from 'components/Icons'
import { Card } from 'components/Card'

import { NavButton } from 'components/Button'
import { ExternalLink } from 'components/Link'

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
  color: ${({ theme }) => theme.text2};
  &:hover {
    cursor: pointer;
    color: ${({ theme }) => theme.text1};
  }

  ${({ active }) =>
    active &&
    `
    pointer-events: none;
  `};
`

export default function Menu() {
  const ref = useRef(null)
  const [isOpen, setIsOpen] = useState(false)
  const [darkMode, toggleDarkMode] = useDarkModeManager()
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
          <Link href="/convert" passHref>
            <Row onClick={() => toggle()} active={router.route === '/convert'}>
              <div>Convert</div>
              <IconWrapper>
                {/* todo: add proper icon */}
                <TradeIcon size={15} />
              </IconWrapper>
            </Row>
          </Link>
          <Link href="/vote" passHref>
            <Row active={router.route === '/vote'}>
              <div>Vote</div>
              <IconWrapper>
                {/* todo: add proper icon */}
                <TradeIcon size={15} />
              </IconWrapper>
            </Row>
          </Link>
          <Link href="/borrow" passHref>
            <Row active={router.route === '/borrow'}>
              <div>Borrow</div>
              <IconWrapper>
                {/* todo: add proper icon */}
                <TradeIcon size={15} />
              </IconWrapper>
            </Row>
          </Link>
          <Row onClick={() => toggleDarkMode()}>
            <div>{darkMode ? 'Light Theme' : 'Dark Theme'}</div>
            <ThemeToggle />
          </Row>
          <ExternalLink href="https://twitter.com/deusdao">
            <Row onClick={() => toggle()}>
              <div>Twitter</div>
              <IconWrapper>
                <TwitterIcon size={15} />
              </IconWrapper>
            </Row>
          </ExternalLink>
          <ExternalLink href="https://t.me/deusfinance">
            <Row onClick={() => toggle()}>
              <div>Community</div>
              <IconWrapper>
                <TelegramIcon size={15} />
              </IconWrapper>
            </Row>
          </ExternalLink>
          <ExternalLink href="https://github.com/deusfinance">
            <Row onClick={() => toggle()}>
              <div>Github</div>
              <IconWrapper>
                <GithubIcon size={15} />
              </IconWrapper>
            </Row>
          </ExternalLink>
        </InlineModal>
      </div>
    </Container>
  )
}
