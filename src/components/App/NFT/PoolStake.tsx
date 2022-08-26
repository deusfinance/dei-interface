import React, { useState, useMemo, useCallback } from 'react'
import styled from 'styled-components'
import { toast } from 'react-hot-toast'

import { useTransactionAdder } from 'state/transactions/hooks'
import useWeb3React from 'hooks/useWeb3'
import { useSupportedChainId } from 'hooks/useSupportedChainId'
import { useVDeusMasterChefV2Contract } from 'hooks/useContract'
import { useStakedVDeusStats } from 'hooks/useVDeusStats'
import { useUserInfo, usePoolInfo } from 'hooks/useVDeusStaking'

import { DefaultHandlerError } from 'utils/parseError'
import { formatAmount } from 'utils/numbers'
import { vDeusStakingType } from 'constants/stakings'
import { DEUS_TOKEN } from 'constants/tokens'

import { ToolTip } from 'components/ToolTip'
// import Dropdown from 'components/DropDown'
import { Row, RowBetween, RowEnd } from 'components/Row'
import { PrimaryButton } from 'components/Button'
import { DotFlashing, Info } from 'components/Icons'

const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  overflow: visible;
  margin: 0 auto;
  & > * {
    &:nth-child(2) {
      border-top-left-radius: 15px;
      border-top-right-radius: 15px;
    }
    &:last-child {
      border-bottom-left-radius: 15px;
      border-bottom-right-radius: 15px;
    }
  }
`

const Wrapper = styled(Container)`
  display: flex;
  justify-content: flex-start;
  border: ${({ theme }) => `2px solid ${theme.bg2}`};
  flex-direction: column;
  margin: 50px 10px 0 10px;
  padding-top: 20px;
  border-radius: 15px;
  background: ${({ theme }) => theme.bg0};

  ${({ theme }) => theme.mediaWidth.upToLarge`
    display: flex;
    justify-content: center;
    flex-direction: column;
  `};
`

const UpperRow = styled(Row)`
  margin: 0 auto;
  flex-direction: column;
`

const DepositButton = styled(PrimaryButton)`
  margin-top: 12px;
  margin-bottom: 4px;
  border-radius: 12px;
  max-width: 312px;
  width: 100%;
  height: 55px;
`

const ClaimButtonWrapper = styled.div`
  background: ${({ theme }) => theme.primary1};

  padding: 1px;
  border-radius: 8px;
  margin-top: 12px;
  margin-bottom: 12px;
  height: 40px;
`

const ClaimButton = styled(PrimaryButton)`
  border-radius: 8px;
  background: ${({ theme }) => theme.bg0};
  height: 100%;
  width: unset;
  white-space: nowrap;
  &:hover {
    & > * {
      &:first-child {
        color: ${({ theme }) => theme.text2};
        -webkit-text-fill-color: black;
        font-weight: 900;
      }
    }
  }
`

const BoxWrapper = styled.div`
  width: 350px;
  padding: 14px 22px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  border-top: ${({ theme }) => `2px solid ${theme.bg2}`};

  ${({ theme }) => theme.mediaWidth.upToMedium`
    max-width: 350px;
  `}
  ${({ theme }) => theme.mediaWidth.upToSmall`
    max-width: 300px;
  `}
`

const DepositWrapper = styled(BoxWrapper)`
  border: none;
`

const WithdrawWrapper = styled(BoxWrapper)`
  display: flex;
  flex-direction: row;
  font-size: 12px;
`

const ClaimWrapper = styled(BoxWrapper)`
  margin: 0 auto;
  display: flex;
  flex-direction: row;
  padding-top: 0;
  padding-bottom: 0;
`

const RewardData = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  padding-top: 6px;
  padding-bottom: 8px;
  margin: 0 auto;
  font-size: 12px;
  background: -webkit-linear-gradient(90deg, #0badf4 0%, #30efe4 93.4%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`

export const DeusText = styled.span`
  background: -webkit-linear-gradient(90deg, #0badf4 0%, #30efe4 93.4%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`

const NFTValue = styled.span`
  font-family: 'IBM Plex Mono';
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;
  color: ${({ theme }) => theme.text1};
`

const YieldTitle = styled.div`
  background: -webkit-linear-gradient(90deg, #e29c53 0%, #ce4c7a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 900;
  font-size: 24px;
  font-family: 'IBM Plex Mono';
  word-spacing: -12px;
`

const TitleInfo = styled.div`
  padding: 20px;
  padding-top: 5px;
  display: flex;
  justify-content: space-between;
  font-family: 'IBM Plex Mono';
`

const TimeTitle = styled.span`
  font-size: 24px;
  font-weight: 700;
  font-family: 'IBM Plex Mono';
  word-spacing: -10px;
  white-space: nowrap;
`

const TitleNFTSpan = styled.span`
  margin: 0 auto;
  text-align: center;
  max-width: 250px;
  color: #979797;
`

const ButtonText = styled.span`
  background: -webkit-linear-gradient(90deg, #e29c53 0%, #ce4c7a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`

const AmountSpan = styled.span`
  color: #fdb572;
`

const InfoIcon = styled(Info)`
  color: ${({ theme }) => theme.yellow2};
  margin-left: 5px;
`
const CustomTooltip = styled(ToolTip)`
  max-width: 380px !important;
  font-size: 14px !important;
`

export default function PoolStake({ pool, flag = false }: { pool: vDeusStakingType; flag: boolean }) {
  const { chainId, account } = useWeb3React()
  const isSupportedChainId = useSupportedChainId()
  const [awaitingClaimConfirmation, setAwaitingClaimConfirmation] = useState<boolean>(false)
  const vDeusStats = useStakedVDeusStats()

  const listOfVouchers = useMemo(() => {
    const poolStaked = vDeusStats.poolIds.map((id, index) => (id === pool.pid ? index : -1))
    return poolStaked.filter((pid) => pid >= 0).map((id) => vDeusStats.listOfStakedVouchers[id])
  }, [vDeusStats, pool])

  const numberOfVouchers = useMemo(() => {
    return listOfVouchers.length
  }, [listOfVouchers])

  const addTransaction = useTransactionAdder()

  const dropdownOptions = listOfVouchers.map((tokenId: number) => ({
    label: `vDEUS #${tokenId}`,
    value: `${tokenId}`,
  }))

  const masterChefContract = useVDeusMasterChefV2Contract(flag)
  const pid = useMemo(() => (flag ? 0 : pool.pid), [flag, pool])
  // const lockedNFTs = useUserLockedNfts()
  const { depositAmount, rewardsAmount, rewardsVDeusAmount } = useUserInfo(pid, flag)
  const { totalDeposited } = usePoolInfo(pid, flag)
  const apr = 25

  const onClaimReward = useCallback(
    async (pid: number) => {
      if (flag) {
        toast.error(`Claim disabled`)
        return
      }
      try {
        if (!masterChefContract || !account || !isSupportedChainId) return
        setAwaitingClaimConfirmation(true)
        const response = await masterChefContract.harvest(pid, account)
        addTransaction(response, { summary: `Claim Rewards`, vest: { hash: response.hash } })
        setAwaitingClaimConfirmation(false)
        // setPendingTxHash(response.hash)
      } catch (err) {
        console.log(err)
        toast.error(DefaultHandlerError(err))
        setAwaitingClaimConfirmation(false)
        // setPendingTxHash('')
      }
    },
    [masterChefContract, account, isSupportedChainId, rewardsAmount, addTransaction, flag]
  )

  function getClaimButton(pool: vDeusStakingType): JSX.Element | null {
    if (awaitingClaimConfirmation) {
      return (
        <>
          <ClaimButtonWrapper>
            <ClaimButton disabled={true}>
              <ButtonText>
                Claim
                <DotFlashing style={{ marginLeft: '10px' }} />
              </ButtonText>
            </ClaimButton>
          </ClaimButtonWrapper>
        </>
      )
    }
    // if (rewardsAmount <= 0) {
    //   return (
    //     <>
    //       <ClaimButtonWrapper>
    //         <ClaimButton disabled={true}>
    //           <ButtonText>Claim</ButtonText>
    //         </ClaimButton>
    //       </ClaimButtonWrapper>
    //     </>
    //   )
    // }
    return (
      <>
        <ClaimButtonWrapper>
          <ClaimButton onClick={() => onClaimReward(pool.pid)}>
            <ButtonText>Claim</ButtonText>
          </ClaimButton>
        </ClaimButtonWrapper>
      </>
    )
  }

  return (
    <Wrapper>
      <TitleInfo>
        <TimeTitle>{pool.name}</TimeTitle>
        <RowEnd>
          <YieldTitle>APR: {apr.toFixed(0)}%</YieldTitle>
          <CustomTooltip id={`${pool.name}`} />
          <InfoIcon
            data-for={`${pool.name}`}
            data-tip={
              'vDEUS APR is calculated on the number of vDEUS you stake, not on your Dollar value, meaning you will have 25% more vDEUS after 1 year'
            }
            size={20}
          />
        </RowEnd>
      </TitleInfo>

      <DepositWrapper>
        {!chainId || !account ? (
          <TitleNFTSpan>Connect your wallet</TitleNFTSpan>
        ) : numberOfVouchers > 0 ? (
          <UpperRow>
            {dropdownOptions.map((nft, index) => (
              <RowBetween key={index} style={{ marginBottom: '15px' }}>
                <DeusText>{nft.label}</DeusText>
              </RowBetween>
            ))}
          </UpperRow>
        ) : (
          <span style={{ marginBottom: '20px' }}>You have no staked NFT</span>
        )}
      </DepositWrapper>

      {depositAmount > 0 && (
        <WithdrawWrapper>
          <span>Your redemption stake: </span>
          <AmountSpan>{formatAmount(depositAmount)} DEI</AmountSpan>
        </WithdrawWrapper>
      )}

      {totalDeposited > 0 && (
        <WithdrawWrapper>
          <span> Total redemption staked: </span>
          <AmountSpan>{formatAmount(totalDeposited)} DEI</AmountSpan>
        </WithdrawWrapper>
      )}

      <ClaimWrapper>
        <div>
          <span style={{ fontSize: '12px' }}>Reward:</span>
          <RewardData>
            <span>{rewardsAmount && rewardsAmount?.toFixed(3)}</span>
            <Row style={{ marginLeft: '10px' }}>
              <span>{DEUS_TOKEN.symbol}</span>
            </Row>
          </RewardData>
          <RewardData style={{ marginTop: '-10px' }}>
            <span>{rewardsVDeusAmount && rewardsVDeusAmount?.toFixed(3)}</span>
            <Row style={{ marginLeft: '10px' }}>
              <span>v{DEUS_TOKEN.symbol}</span>
            </Row>
          </RewardData>
        </div>
        <div>{getClaimButton(pool)}</div>
      </ClaimWrapper>
    </Wrapper>
  )
}
