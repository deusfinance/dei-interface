import React, { useMemo } from 'react'
import Fuse from 'fuse.js'
import styled from 'styled-components'
import { useSelect, SelectSearchOption } from 'react-select-search'

import { useBorrowPools } from 'state/borrow/hooks'
import { Search as SearchIcon } from 'components/Icons'
import Box from './Box'

const Wrapper = styled(Box)`
  width: 240px;
  padding: 0 20px;
`

const Input = styled.input<{
  [x: string]: any
}>`
  height: 40px;
  flex: 1;
  border: none;
  background: transparent;
  font-size: 1.1rem;
  color: ${({ theme }) => theme.text1};
  &:focus,
  &:hover {
    outline: none;
  }
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    font-size: 0.9rem;
  `}
`

function fuzzySearch(options: SelectSearchOption[]): any {
  const config = {
    keys: ['contract', 'composition.name'],
    isCaseSensitive: false,
    threshold: 0.2,
  }

  const fuse = new Fuse(options, config)

  return (query: string) => {
    if (!query) {
      return options
    }

    return fuse.search(query)
  }
}

export function useSearch() {
  const borrowList = useBorrowPools()
  const list: SelectSearchOption[] = useMemo(() => {
    return borrowList.map((o) => ({ ...o, name: o.composition, value: o.contract }))
  }, [borrowList])

  const [snapshot, searchProps, optionProps] = useSelect({
    options: list,
    value: '',
    search: true,
    filterOptions: fuzzySearch,
    allowEmpty: true,
    closeOnSelect: false,
  })

  return {
    snapshot,
    searchProps,
    optionProps,
  }
}

export function SearchField({ searchProps }: { searchProps: any }) {
  return (
    <Wrapper>
      <Input
        {...searchProps}
        title="Search"
        autoFocus
        type="text"
        placeholder="Search"
        spellCheck="false"
        onBlur={() => null}
      />
      <SearchIcon />
    </Wrapper>
  )
}
