import { useVaultContract } from 'hooks/useContract'
import useWeb3React from 'hooks/useWeb3'

export function useVault() {
  const vaultContract = useVaultContract()
  const { account } = useWeb3React()

  const sellVeNFT = async (tokenId: number) => {
    if (!vaultContract) return
    console.log(vaultContract)
    await vaultContract.sell(tokenId)
  }
  return { sellVeNFT }
}
