import React, { useMemo } from 'react'
import Fuse from 'fuse.js'
import { useSelect, SelectSearchOption } from 'react-select-search'

import { Search as SearchIcon } from 'components/Icons'
import { InputWrapper, InputField } from 'components/Input'
import { useOwnedVDeusNfts } from 'hooks/useVDeusNfts'

function fuzzySearch(options: SelectSearchOption[]): any {
  const config = {
    keys: ['name', 'value', 'tokenId'],
    isCaseSensitive: false,
    threshold: 0.15,
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
  const nftIdsList = useOwnedVDeusNfts()
  const list: SelectSearchOption[] = useMemo(() => {
    return nftIdsList.map((o) => ({ ...o, tokenId: o.tokenId, name: o.tokenId.toString(), value: o.value }))
  }, [nftIdsList])

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
    <InputWrapper>
      <InputField
        {...searchProps}
        title="Search"
        autoFocus
        type="text"
        placeholder="Search"
        spellCheck="false"
        onBlur={() => null}
      />
      <SearchIcon />
    </InputWrapper>
  )
}
