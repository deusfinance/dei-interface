import React, { useEffect, useState } from 'react'

import Hero, { HeroSubtext } from 'components/Hero'
import Disclaimer from 'components/Disclaimer'
import { SearchField, useSearch } from 'components/App/Borrow'
import { Container, Slider, TableBuy, Wrapper } from 'components/App/Venft'
import styled from 'styled-components'
import { getVenftItems } from '../../api/venft'
import { VenftItem } from '../../api/types'

const FiltersWrapper = styled.div`
  display: flex;
  margin-bottom: 25px;
`

const SearchFieldWrapper = styled.div`
  width: 34%;
`

const RangeWrapper = styled.div`
  margin-left: 10px;
  width: 33%;
  vertical-align: center;
  display: flex;
  align-items: end;
`

const RangeLabelWrapper = styled.span`
  vertical-align: center;
  font-size: 11px;
  width: 30px;
  padding-bottom: 5px;
  text-align: center;
`

const SliderWrapper = styled.span`
  text-align: center;
  width: 100%;
  padding: 10px;
`

export default function Buy() {
  const { searchProps } = useSearch()
  const [amountRange, setAmountRange] = useState([0, 100])
  const [minAmount, maxAmount] = amountRange

  const [timeRange, setTimeRange] = useState([0, 100])
  const [minTime, maxTime] = timeRange
  const [venftItems, setVenftItems] = useState<VenftItem[]>([])
  useEffect(() => {
    let mounted = true
    const fn = async () => {
      const items = await getVenftItems()
      if (mounted) {
        setVenftItems(items)
      }
    }
    fn()
    return () => {
      mounted = false
    }
  }, [])
  return (
    <Container>
      <Hero>
        <div>BUY veNFT</div>
        <HeroSubtext>Buy veNFT</HeroSubtext>
      </Hero>
      <Wrapper>
        <FiltersWrapper>
          <SearchFieldWrapper>
            <SearchField searchProps={searchProps} />
          </SearchFieldWrapper>
          <RangeWrapper>
            <RangeLabelWrapper>{minAmount}</RangeLabelWrapper>
            <SliderWrapper>
              <Slider label={'amount'} min={0} max={100} values={amountRange} setValues={setAmountRange} />
            </SliderWrapper>
            <RangeLabelWrapper>{maxAmount}</RangeLabelWrapper>
          </RangeWrapper>
          <RangeWrapper>
            <RangeLabelWrapper>{minTime}</RangeLabelWrapper>
            <SliderWrapper>
              <Slider label={'time'} min={0} max={100} values={timeRange} setValues={setTimeRange} />
            </SliderWrapper>
            <RangeLabelWrapper>{maxTime}</RangeLabelWrapper>
          </RangeWrapper>
        </FiltersWrapper>
        <TableBuy venftItems={venftItems} />
      </Wrapper>
      <Disclaimer />
    </Container>
  )
}
