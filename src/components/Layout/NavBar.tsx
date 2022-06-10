import React from 'react'
import styled from 'styled-components'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { isMobileOnly as isMobile } from 'react-device-detect'

import { Z_INDEX } from 'theme'

import Web3Network from 'components/Web3Network'
import Web3Status from 'components/Web3Status'
import Menu from './Menu'
import NavLogo from './NavLogo'

const Wrapper = styled.div`
  padding: 0px 2rem;
  height: 55px;
  align-items: center;
  background: ${({ theme }) => theme.bg1};
  gap: 5px;
  z-index: ${Z_INDEX.fixed};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 0px 1.25rem;
  `};
`

const DefaultWrapper = styled(Wrapper)`
  display: flex;
  flex-flow: row nowrap;
  & > * {
    &:first-child {
      flex: 1;
    }
    &:last-child {
      flex: 1;
    }
  }
`

const MobileWrapper = styled(Wrapper)`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
`

const Routes = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  gap: 5px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    & > * {
      &:nth-child(2) {
        display: none;
      }
    }
  `};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    & > * {
      &:nth-child(1),
      &:nth-child(3),
      &:nth-child(4)
     {
        display: none;
      }
    }
  `};
`

const Items = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-end;
  gap: 5px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
  `}
`

const NavLink = styled.div<{
  active: boolean
}>`
  font-size: 1rem;
  padding: 0.25rem 1rem;
  text-align: center;
  color: ${({ theme }) => theme.text1};

  ${({ active, theme }) =>
    active &&
    `
    pointer-events: none;
    text-decoration: underline;
    text-decoration-color: ${theme.primary2};
    text-underline-offset: 6px;
  `};

  &:hover {
    cursor: pointer;
    color: ${({ theme }) => theme.primary1};
  }
`

export default function NavBar() {
  const router = useRouter()

  function getMobileContent() {
    return (
      <MobileWrapper>
        <NavLogo />
        <Web3Status />
        <Menu />
      </MobileWrapper>
    )
  }

  function getDefaultContent() {
    return (
      <DefaultWrapper>
        <NavLogo />
        <Routes>
          <Link href="/redemption" passHref>
            <NavLink active={router.route === '/redemption'}>Redemption</NavLink>
          </Link>
          <Link href="/deibonds" passHref>
            <NavLink active={router.route === '/deibonds'}>DeiBonds</NavLink>
          </Link>
          <Link href="/deibonds/pools" passHref>
            <NavLink active={router.route === '/deibonds/pools'}>Pools</NavLink>
          </Link>
          <Link href="/deibonds/liquidity" passHref>
            <NavLink active={router.route === '/deibonds/liquidity'}>Liquidity</NavLink>
          </Link>
          <Link href="/borrow" passHref>
            <NavLink active={router.route === '/borrow'}>Borrow</NavLink>
          </Link>
          <Link href="/vest" passHref>
            <NavLink active={router.route === '/vest'}>Vest</NavLink>
          </Link>
          <Link href="/rewards" passHref>
            <NavLink active={router.route === '/rewards'}>Rewards</NavLink>
          </Link>

          {/* <Link href="/liquidity" passHref>
            <NavLink active={router.route === '/liquidity'}>Liquidity</NavLink>
          </Link> */}
        </Routes>
        <Items>
          <Web3Network />
          <Web3Status />
          <Menu />
        </Items>
      </DefaultWrapper>
    )
  }

  return isMobile ? getMobileContent() : getDefaultContent()
}
