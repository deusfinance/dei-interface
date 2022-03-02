import styled from 'styled-components'

const Box = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  width: 240px;
  height: 45px;
  align-items: center;
  background: ${({ theme }) => theme.bg1};
  border: 1px solid ${({ theme }) => theme.border1};
  padding: 0 20px;
  color: ${({ theme }) => theme.text2};
`

export default Box
