import { Link as LinkIconLogo } from 'components/Icons'
import ImageWithFallback from 'components/ImageWithFallback'
import { ExternalLink } from 'components/Link'
import { Row } from 'components/Row'
import styled from 'styled-components'

const Item = styled.div<{ darkBorder?: boolean }>`
  display: inline-block;
  padding: 0 24px;
  border-right: 1px solid ${({ theme, darkBorder }) => (darkBorder ? theme.bg4 : theme.warning1)};
  white-space: nowrap;
  /* width: 33%; */
  min-width: 130px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding:0 12px;
    width: 50%;
  `};
`

const Name = styled(Row)`
  font-family: 'Inter';
  font-weight: 400;
  font-size: 12px;
  color: ${({ theme }) => theme.text1};
  white-space: nowrap;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    white-space: break-spaces;
  `};
`

const Value = styled.span<{
  DeusActive?: boolean
  DeiActive?: boolean
  legacyDeiActive?: boolean
  isLink?: boolean
  noColor?: boolean
}>`
  font-weight: 500;
  font-size: 14px;
  background: ${({ theme, DeusActive }) => DeusActive && theme.deusColor};
  background: ${({ theme, DeiActive }) => DeiActive && theme.deiColor};
  background: ${({ theme, legacyDeiActive }) => legacyDeiActive && theme.legacyDeiColor};
  background: ${({ theme, noColor }) => noColor && theme.yellow4};

  margin-top: 10px;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  cursor: ${({ isLink }) => (isLink ? 'pointer' : 'auto')};
  & > * {
    margin-left: 6px;
  }
`

const Logo = styled.div`
  min-width: 12px;
  min-height: 12px;
  margin-left: 4px;
`

export default function StatsItem({
  name,
  value,
  logo,
  href,
  darkBorder,
  noColor,
}: {
  name: string
  value: string
  logo?: string
  href?: string
  darkBorder?: boolean
  noColor?: boolean
}) {
  const isLink = !!href
  return (
    <Item darkBorder={darkBorder}>
      <Name>
        {name}
        <Logo>{logo && <ImageWithFallback src={logo} width={16} height={15} alt={'Logo'} />}</Logo>
      </Name>
      {isLink ? (
        <ExternalLink href={href} passHref>
          <Value
            DeusActive={name?.includes('DEUS')}
            DeiActive={name?.includes('DEI')}
            legacyDeiActive={name?.includes('legacy')}
            noColor={noColor}
            isLink
          >
            {value}
            <LinkIconLogo />
          </Value>
        </ExternalLink>
      ) : (
        <Value
          DeusActive={name?.includes('DEUS')}
          DeiActive={name?.includes('DEI')}
          legacyDeiActive={name?.includes('legacy')}
          noColor={noColor}
        >
          {value}
        </Value>
      )}

      {/*!!onClick ? (
        <Value
          DeusActive={name?.includes('DEUS')}
          DeiActive={name?.includes('DEI')}
          legacyDeiActive={name?.includes('legacy')}
          noColor={noColor}
          isLink
        >
          {value}
          <LinkIconLogo />
        </Value>
      ) : ( */}
    </Item>
  )
}
