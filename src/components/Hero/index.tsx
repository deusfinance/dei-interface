import styled from 'styled-components'

const Hero = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  width: 100%;
  height: 200px;
  align-items: center;
  font-size: 60px;
  font-weight: bold;
  background: ${({ theme }) => theme.bg1};
  gap: 10px;
`

export const HeroSubtext = styled.div`
  font-size: 0.8rem;
  font-weight: normal;
  width: 50%;
  text-align: center;
`

export default Hero
