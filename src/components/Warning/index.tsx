import styled from 'styled-components'

export const Warning = styled.div`
  text-align: center;
  width: 100%;
  height: fit-content;
  padding: 10px;
  font-size: 0.6rem;
  border: 1px solid ${({ theme }) => theme.red1};
  box-shadow: 1px 1px ${({ theme }) => theme.red2};
`
