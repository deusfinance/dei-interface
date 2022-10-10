import styled from 'styled-components'

const InfoWrap = styled.div`
  flex-basis: 16%;
`

export default function InfoCell({ title, text }: { title: string; text: string }) {
  return (
    <InfoWrap>
      <span>{title}: </span>
      <span>{text}</span>
    </InfoWrap>
  )
}
