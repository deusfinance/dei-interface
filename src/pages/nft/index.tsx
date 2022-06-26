import React, { useState, useMemo, useCallback } from 'react'
import styled from 'styled-components'

import { useCurrencyBalance } from 'state/wallet/hooks'
import { useWalletModalToggle } from 'state/application/hooks'
import useWeb3React from 'hooks/useWeb3'
import { useSupportedChainId } from 'hooks/useSupportedChainId'
import useApproveCallback, { ApprovalState } from 'hooks/useApproveCallback'
import { tryParseAmount } from 'utils/parse'

import { PrimaryButton } from 'components/Button'
import { DotFlashing } from 'components/Icons'
import Hero from 'components/Hero'
import Disclaimer from 'components/Disclaimer'

import { DEI_TOKEN, BDEI_TOKEN } from 'constants/tokens'
import Dropdown from 'components/DropDown'
import { RowBetween, RowCenter } from 'components/Row'

const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  overflow: visible;
  margin: 0 auto;
`

const Wrapper = styled(Container)`
  margin-top: 50px;
  width: clamp(250px, 90%, 500px);
  background-color: rgb(13 13 13);
  padding: 20px 15px;
  border: 1px solid rgb(0, 0, 0);
  border-radius: 15px;
  /* border-bottom-right-radius: 0; */
  /* border-bottom-left-radius: 0; */
  /* & > * {
    &:nth-child(2) {
      margin: 15px auto;
    }
  } */
`

const UpperRow = styled(RowCenter)`
  gap: 10px;
  margin: 0 auto;
  height: 50px;
  background: green;
  ${({ theme }) => theme.mediaWidth.upToMedium`
      display: flex;
      justify-content:center;
      flex-direction:column;
    `}
  & > * {
    height: 100%;
    max-width: fit-content;
    &:first-child {
      max-width: 400px;
      margin-right: auto;
    }
  }
`

const TopWrapper = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  width: 100%;
  max-width: 1200px;
  margin 0 auto;
`

const FarmWrapper = styled(Wrapper)`
  border-radius: 15px;
  padding: 0;
  & > * {
    &:nth-child(1) {
      padding: 0;
      border: 0;
      padding-bottom: 20px;
    }
  }
`

const LiquidityWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 50%;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    width: 100%;
    margin: 0 auto;
  `}
`

const ToggleState = styled.div`
  display: flex;
  justify-content: space-between;
  background-color: rgb(13 13 13);
  border-radius: 15px;
  margin: 0 auto;
  margin-top: 50px;
  margin-bottom: -45px;
  width: clamp(250px, 90%, 500px);
`

const StateButton = styled.div`
  width: 50%;
  text-align: center;
  padding: 12px;
  cursor: pointer;
`

const DepositButton = styled(PrimaryButton)`
  border-radius: 15px;
`

const LeftTitle = styled.span`
  font-size: 24px;
  font-weight: 500;
`

const DepositWrapper = styled.div``

const WithdrawWrapper = styled.div`
  background: blue;
`
const ClaimWrapper = styled.div`
  background: yellow;
`

export default function NFT() {
  const { chainId, account } = useWeb3React()
  const toggleWalletModal = useWalletModalToggle()
  const isSupportedChainId = useSupportedChainId()
  const [dropDownDefaultValue, setDropDownDefaultValue] = useState('0')

  const dropdownOnSelect = useCallback((val: string) => {
    console.log('drow down on select', { val })
    return
  }, [])

  const dropdownOptions = [
    { value: '1', label: '1 dep' },
    { value: '2', label: '2' },
    { value: '3', label: '3' },
  ]

  return (
    <Container>
      <Hero>
        <div>NFT</div>
      </Hero>
      <Wrapper>
        <DepositWrapper>
          <UpperRow>
            {/* <SearchField searchProps={searchProps} /> */}
            <Dropdown
              options={dropdownOptions}
              placeholder="Select Token ID"
              defaultValue={dropDownDefaultValue}
              onSelect={(v) => dropdownOnSelect(v)}
              width="200px"
            />
          </UpperRow>
        </DepositWrapper>

        <WithdrawWrapper>Hello</WithdrawWrapper>
        <ClaimWrapper>Heu</ClaimWrapper>
      </Wrapper>

      <Disclaimer />
    </Container>
  )
}
