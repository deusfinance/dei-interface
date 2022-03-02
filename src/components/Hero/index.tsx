import styled from 'styled-components'

const Hero = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  width: 100%;
  height: 200px;
  align-items: center;
  font-size: 60px;
  font-weight: bold;
  background: ${({ theme }) => theme.bg1};
`

export default Hero
