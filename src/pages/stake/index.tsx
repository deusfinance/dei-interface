import React from 'react'
import styled from 'styled-components'

// import { useWalletModalToggle } from 'state/application/hooks'
// import useWeb3React from 'hooks/useWeb3'
// import { useSupportedChainId } from 'hooks/useSupportedChainId'

import Hero from 'components/Hero'
import Disclaimer from 'components/Disclaimer'
import ImageWithFallback from 'components/ImageWithFallback'
import STAKE_ICON from '/public/static/images/pages/ic_stake.svg'
import { RowCenter } from 'components/Row'
import TokenBox from 'components/App/Stake/TokenBox'
import { Stakings } from 'constants/stakingPools'
import InfoCell from 'components/App/Stake/InfoCell'
import RewardBox from 'components/App/Stake/RewardBox'
import { useRouter } from 'next/router'

export const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  overflow: visible;
  margin: 0 auto;
`

const Wrapper = styled(Container)`
  flex-flow: row wrap;
  margin-top: 20px;
  background: ${({ theme }) => theme.bg1};
  border: 1px solid rgb(0, 0, 0);
  width: 344px;
  height: 472px;
  border-radius: 12px 0px 0px 12px;
`

const TopWrapper = styled(RowCenter)`
  flex-wrap: wrap;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  margin-top: 20px;
  font-size: 14px;
  cursor: pointer;
`

const StakeBox = styled.div<{ active: boolean }>`
  display: flex;
  flex-direction: row;
  background: ${({ theme }) => theme.bg1};
  border-radius: 12px;
  width: 100%;
  height: 100px;
  padding: 20px;
  align-items: center;

  & > * {
    opacity: ${({ active }) => (active ? '1' : '0.4')};
  }

  /* ${({ theme }) => theme.mediaWidth.upToMedium`
    width: 100%;
    margin: 0 auto;
  `} */
`

export default function Stake() {
  // const { chainId, account } = useWeb3React()
  // const toggleWalletModal = useWalletModalToggle()
  // const isSupportedChainId = useSupportedChainId()
  const router = useRouter()

  return (
    <Container>
      <Hero>
        <ImageWithFallback src={STAKE_ICON} width={224} height={133} alt={`Logo`} />
      </Hero>

      {Stakings.map((staking, index) => {
        const { pid, tokens, lpToken, rewardTokens, active } = staking
        return (
          <TopWrapper key={index} onClick={() => router.push(`/stake/${pid}`)}>
            <StakeBox active={active}>
              <TokenBox tokens={tokens} />
              {active ? <InfoCell title={'APR'} text={'4%'} /> : <span style={{ flexBasis: '12%' }}>Disable</span>}
              <InfoCell title={'TVL'} text={'$4.58m'} />
              <InfoCell title={'Your Stake'} text={`0.00 ${lpToken.symbol}`} size={'22%'} />
              <RewardBox tokens={rewardTokens} />
            </StakeBox>
          </TopWrapper>
        )
      })}

      <Disclaimer />
    </Container>
  )
}
