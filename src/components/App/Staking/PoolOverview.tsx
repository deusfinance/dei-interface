import { Row } from 'components/Row'
import React from 'react'
import styled from 'styled-components'

import { PrimaryButton } from 'components/Button'
import ImageWithFallback from 'components/ImageWithFallback'
import useCurrencyLogo from 'hooks/useCurrencyLogo'
import { Loader } from 'components/Icons'

const Container = styled.div`
  /* display: flex; */
  /* flex-flow: column nowrap; */
  /* overflow: visible; */
  /* margin: 0 auto; */
`

const Wrapper = styled(Container)`
  margin: 0 auto;
  /* width: clamp(250px, 90%, 500px); */
  background-color: rgb(13 13 13);
  padding: 20px 15px;
  /* border: 1px solid rgb(0, 0, 0); */
  /* border-radius: 15px; */
  /* justify-content: center; */
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 0 95px;

  & > * {
    /* margin: 0 25px; */
    text-align: center;
    /* line-height: 25px; */
  }
`

const Name = styled.div`
  font-size: 22px;
  font-weight: bold;
  white-space: nowrap;
  max-width: 25%;
`

const Coins = styled.div`
  display: flex;
  white-space: nowrap;
  flex-direction: column;
  max-width: 25%;
`

const PoolInfo = styled.div`
  white-space: nowrap;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 25%;
`

const DepositButton = styled(PrimaryButton)`
  margin-bottom: 10px;
  border-radius: 15px;
`

const WithdrawButton = styled(PrimaryButton)`
  border-radius: 15px;
`

const ItemValue = styled.div`
  color: ${({ theme }) => theme.yellow3};
  margin-left: 5px;
`

export default function PoolOverview() {
  const showLoader = true

  return (
    // <Container>
    <Wrapper>
      <Name> DEI-BDEI </Name>
      <Coins>
        <Row>
          <BalanceRow address={'DEI'} symbol="DEI" />
        </Row>
        <Row>
          <BalanceRow address={'DEI'} symbol="BDEI" />
        </Row>
      </Coins>
      <PoolInfo>
        <Row>
          TVL <ItemValue>{showLoader ? <Loader /> : '12'}</ItemValue>
        </Row>
        <Row>
          24h Vol. <ItemValue>{showLoader ? <Loader /> : '12'}</ItemValue>
        </Row>
      </PoolInfo>
      <PoolInfo>
        <Row>
          APY:<ItemValue>{showLoader ? <Loader /> : '12'}</ItemValue>
        </Row>
        <Row>
          Reward APR:<ItemValue>{showLoader ? <Loader /> : '12'}</ItemValue>
        </Row>
      </PoolInfo>
      <PoolInfo>
        <DepositButton active>Deposit</DepositButton>
        <WithdrawButton active>Withdraw</WithdrawButton>
      </PoolInfo>
    </Wrapper>
    // </Container>
  )
}

function BalanceRow({ address, symbol }: { address: string; symbol: string }) {
  const logo = useCurrencyLogo(address)
  return (
    <Row>
      <ImageWithFallback src={logo} alt={`${symbol} logo`} width={40} height={40} />
      {symbol}
    </Row>
  )
}
