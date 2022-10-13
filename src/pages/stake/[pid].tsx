import { useRouter } from 'next/router'

import Hero from 'components/Hero'
import Disclaimer from 'components/Disclaimer'
import ImageWithFallback from 'components/ImageWithFallback'
import STAKE_ICON from '/public/static/images/pages/ic_stake.svg'
import { Container } from '.'
import { Stakings } from 'constants/stakingPools'

export default function StakingPool() {
  const router = useRouter()
  const { pid } = router.query
  const pidNumber = Number(pid)
  const pool = Stakings.find((pool) => pool.pid === pidNumber) || Stakings[0]

  return (
    <Container>
      <Hero>
        <ImageWithFallback src={STAKE_ICON} width={224} height={133} alt={`Logo`} />
      </Hero>
      <span>{pool.name}</span>
      <Disclaimer />
    </Container>
  )
}
