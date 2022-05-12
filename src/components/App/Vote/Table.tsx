import React, { useMemo, useState } from 'react'
import styled from 'styled-components'
import { darken } from 'polished'
import BigNumber from 'bignumber.js'
import { areEqual } from 'react-window'

import Pagination from 'components/Pagination'
import { DualImageWrapper } from 'components/DualImage'
import ImageWithFallback from 'components/ImageWithFallback'
import Slider from 'components/Slider'
import Copy from 'components/Copy'

import { SolidlyPair } from 'apollo/queries'
import { ZERO_ADDRESS } from 'constants/addresses'
import { formatAmount } from 'utils/numbers'

import useCurrencyLogo from 'hooks/useCurrencyLogo'
import { VoteType } from 'hooks/useVoteCallback'
import { useSolidlyGaugeData, useSolidlyGaugeReserves, useSolidlyPairData } from 'hooks/useSolidlyData'

const Wrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: space-between;
`

const TableWrapper = styled.table`
  width: 100%;
  overflow: hidden;
  border-collapse: collapse;
`

const Head = styled.thead`
  & > tr {
    height: 56px;
    font-size: 0.8rem;
    color: ${({ theme }) => theme.text1};
    background: ${({ theme }) => theme.bg0};

    & > * {
      text-align: center;
    }
  }
`

const Row = styled.tr`
  align-items: center;
  height: 21px;
  font-size: 0.7rem;
  line-height: 0.7rem;
  color: ${({ theme }) => theme.text1};
`

const NoResults = styled.div`
  text-align: center;
  padding: 20px;
`

const Cell = styled.td`
  padding: 20px;
  border: 1px solid ${({ theme }) => theme.border1};
  height: 90px;
  text-align: center;

  & > span {
    color: ${({ theme }) => theme.primary3};
  }

  &:first-of-type {
    max-width: 250px;
    text-align: left;
  }

  // Your Balance
  ${({ theme }) => theme.mediaWidth.upToExtraLarge`
    :nth-child(2) {
      display: none;
    }
  `}

  // Total Pool Amount
  ${({ theme }) => theme.mediaWidth.upToLarge`
    :nth-child(5) {
      display: none;
    }
  `}

  // Total Pool Staked
  ${({ theme }) => theme.mediaWidth.upToMedium`
    :nth-child(6) {
      display: none;
    }
  `}

  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 0.6rem;
  
    // Your Pool Amount
    :nth-child(3) {
      display: none;
    }
    // Your Staked Amount
    :nth-child(4) {
      display: none;
    }
  `}

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    :nth-child(6) {
      display: none;
    }
  `}

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    
    // Your Slider 
    :nth-child(7) {
      width: 150px;
    }
  `}
`

const AmountRow = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  gap: 10px;
  & > * {
    width: 50%;
    &:first-child {
      text-align: right;
    }
    &:last-child {
      text-align: left;
      color: ${({ theme }) => darken(0.3, theme.primary3)};
    }
  }
`

const PairWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
  gap: 15px;

  & > * {
    &:last-child {
      display: flex;
      flex-flow: column nowrap;
      align-items: flex-start;
      margin-left: auto;
    }
  }
`

const NameWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  font-size: 0.6rem;
  & > * {
    &:first-child {
      font-size: 0.8rem;
      color: ${({ theme }) => theme.primary3};
    }
    &:nth-child(2) {
      margin-top: 8px;
    }
  }
`

const itemsPerPage = 5
export default function Table({
  options,
  votes,
  preVotedPairs,
  setVotes,
}: {
  options: SolidlyPair[]
  votes: VoteType[]
  preVotedPairs: VoteType[] | null
  setVotes: (votes: VoteType[]) => void
}) {
  const [offset, setOffset] = useState(0)

  const paginatedOptions = useMemo(() => {
    return options.slice(offset, offset + itemsPerPage)
  }, [options, offset])

  const pageCount = useMemo(() => {
    return Math.ceil(options.length / itemsPerPage)
  }, [options])

  const onPageChange = ({ selected }: { selected: number }) => {
    setOffset(Math.ceil(selected * itemsPerPage))
  }

  const onSliderChange = (values: number, pair: SolidlyPair) => {
    const currentVoteIndex = votes.findIndex((v) => v.address === pair.id)

    if (currentVoteIndex > -1) {
      votes[currentVoteIndex].amount = values
    } else {
      const newVote = { address: pair.id, amount: values }
      votes.push(newVote)
    }

    setVotes([...votes])
  }

  const pairPercent = (pair: SolidlyPair) => {
    const voteIndex = votes.findIndex((v) => v.address === pair.id)
    if (voteIndex > -1) return votes[voteIndex].amount
    else return 0
  }

  const findAmount = (pair: SolidlyPair) => {
    if (preVotedPairs === null) return -100

    const ourPairIndex = preVotedPairs.findIndex((v) => v.address === pair.id)
    if (ourPairIndex > -1) {
      return preVotedPairs[ourPairIndex].amount
    }
    return -100
  }

  return (
    <Wrapper>
      <TableWrapper>
        <Head>
          <tr>
            <Cell>Asset</Cell>
            <Cell>My Stake</Cell>
            <Cell>Total Liquidity</Cell>
            <Cell>Total Votes</Cell>
            <Cell>Bribes</Cell>
            <Cell>My Votes</Cell>
            <Cell>My Vote %</Cell>
          </tr>
        </Head>
        <tbody>
          {paginatedOptions.length > 0 &&
            paginatedOptions.map((pair: SolidlyPair, index) => (
              <MemoTableRow
                key={index}
                pair={pair}
                percent={pairPercent(pair)}
                onPairSliderChange={onSliderChange}
                minSliderAmount={findAmount(pair)}
              />
            ))}
        </tbody>
      </TableWrapper>
      {paginatedOptions.length == 0 && <NoResults>No Results Found</NoResults>}
      {paginatedOptions.length > 0 && <Pagination pageCount={pageCount} onPageChange={onPageChange} />}
    </Wrapper>
  )
}

const MemoTableRow = React.memo(TableRow, areEqual)

function TableRow({
  pair,
  percent,
  minSliderAmount,
  onPairSliderChange,
}: {
  pair: SolidlyPair
  percent: number
  minSliderAmount: number
  onPairSliderChange: (values: number, pair: SolidlyPair) => void
}) {
  const logoOne = useCurrencyLogo(pair.token0.symbol)
  const logoTwo = useCurrencyLogo(pair.token1.symbol)

  const {
    userPoolBalance,
    userToken0Balance,
    userToken1Balance,
    poolTotalSupply,
    poolReserve0,
    poolReserve1,
    gaugeAddress,
  } = useSolidlyPairData(pair)

  const { gaugeTotalSupply, gaugeUserBalance } = useSolidlyGaugeData(gaugeAddress)
  const { gaugeReserve0, gaugeReserve1 } = useSolidlyGaugeReserves(
    gaugeTotalSupply,
    poolTotalSupply,
    poolReserve0,
    poolReserve1
  )

  const userPoolAmount0: BigNumber = useMemo(() => {
    if (!parseFloat(userPoolBalance) || !parseFloat(poolTotalSupply) || !parseFloat(poolReserve0)) {
      return new BigNumber('0')
    }
    return new BigNumber(userPoolBalance).div(poolTotalSupply).times(poolReserve0)
  }, [userPoolBalance, poolTotalSupply, poolReserve0])

  const userPoolAmount1: BigNumber = useMemo(() => {
    if (!parseFloat(userPoolBalance) || !parseFloat(poolTotalSupply) || !parseFloat(poolReserve1)) {
      return new BigNumber('0')
    }
    return new BigNumber(userPoolBalance).div(poolTotalSupply).times(poolReserve1)
  }, [userPoolBalance, poolTotalSupply, poolReserve1])

  const [balance0, balance1] = useMemo(
    () => [
      parseFloat(userToken0Balance) ? formatAmount(parseFloat(userToken0Balance), 5) : '0.00',
      parseFloat(userToken1Balance) ? formatAmount(parseFloat(userToken1Balance), 5) : '0.00',
    ],
    [userToken0Balance, userToken1Balance]
  )

  const [pReserve0, pReserve1] = useMemo(
    () => [new BigNumber(poolReserve0), new BigNumber(poolReserve1)],
    [poolReserve0, poolReserve1]
  )

  const [stakedAmount0, stakedAmount1] = useMemo(
    () => [
      parseFloat(gaugeTotalSupply) ? gaugeReserve0.times(gaugeUserBalance).div(gaugeTotalSupply).toFixed(2) : '0.00',
      parseFloat(gaugeTotalSupply) ? gaugeReserve1.times(gaugeUserBalance).div(gaugeTotalSupply).toFixed(2) : '0.00',
    ],
    [gaugeUserBalance, gaugeTotalSupply, gaugeReserve0, gaugeReserve1]
  )

  const [token0Symbol, token1Symbol] = useMemo(
    () => [pair.token0.symbol.substring(0, 6), pair.token1.symbol.substring(0, 6)],
    [pair]
  )

  const onSliderChange = (values: number) => {
    onPairSliderChange(values, pair)
  }

  return (
    <Row>
      <Cell>
        <PairWrapper>
          <DualImageWrapper>
            <ImageWithFallback src={logoOne} alt={`${pair.token0.symbol} logo`} width={30} height={30} />
            <ImageWithFallback src={logoTwo} alt={`${pair.token1.symbol} logo`} width={30} height={30} />
          </DualImageWrapper>
          <NameWrapper>
            <div>
              {pair.token0.symbol} / {pair.token1.symbol}
            </div>
            <div>{pair.symbol}</div>
            <div>{pair.stable ? 'Stable Pool' : 'Volatile Pool'}</div>
          </NameWrapper>
          <Copy toCopy={pair.id} placement="right" noFeedback />
        </PairWrapper>
      </Cell>
      <Cell>
        <AmountRow>
          <div>{balance0}</div>
          <div>{token0Symbol}</div>
        </AmountRow>
        <AmountRow>
          <div>{balance1}</div>
          <div>{token1Symbol}</div>
        </AmountRow>
      </Cell>
      <Cell>
        <AmountRow>
          <div>{userPoolAmount0.toFixed(2)}</div>
          <div>{token0Symbol}</div>
        </AmountRow>
        <AmountRow>
          <div>{userPoolAmount1.toFixed(2)}</div>
          <div>{token1Symbol}</div>
        </AmountRow>
      </Cell>
      <Cell>
        {gaugeAddress && gaugeAddress !== ZERO_ADDRESS ? (
          <>
            <AmountRow>
              <div>{stakedAmount0}</div>
              <div>{token0Symbol}</div>
            </AmountRow>
            <AmountRow>
              <div>{stakedAmount1}</div>
              <div>{token0Symbol}</div>
            </AmountRow>
          </>
        ) : (
          <div>Gauge not available</div>
        )}
      </Cell>
      <Cell>
        <AmountRow>
          <div>{pReserve0.toFixed(2)}</div>
          <div>{token0Symbol}</div>
        </AmountRow>
        <AmountRow>
          <div>{pReserve1.toFixed(2)}</div>
          <div>{token1Symbol}</div>
        </AmountRow>
      </Cell>
      <Cell>
        {gaugeAddress && gaugeAddress !== ZERO_ADDRESS ? (
          <>
            <AmountRow>
              <div>{gaugeReserve0.toFixed(2)}</div>
              <div>{token0Symbol}</div>
            </AmountRow>
            <AmountRow>
              <div>{gaugeReserve1.toFixed(2)}</div>
              <div>{token1Symbol}</div>
            </AmountRow>
          </>
        ) : (
          <div>Gauge not available</div>
        )}
      </Cell>
      <Cell>
        <Slider percent={percent} onSliderChange={onSliderChange} min={minSliderAmount} />
      </Cell>
    </Row>
  )
}
