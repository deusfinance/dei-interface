// use apy (decimal)
// array of id => res : array of result

import { useMemo } from "react"
import { useSingleContractMultipleMethods } from "state/multicall/hooks"

const getAPY = () => {}
export default useBonded(){
    const isSupportedChainId = useSupportedChainId()
    const ids = []
    // TODO
    // const bondsContract  = 
    const calls = useMemo(
        () =>
          !isSupportedChainId
            ? []
            : [
                {
                  methodName: 'APY method',
                  callInputs: [],
                },
                {
                  methodName: '',
                  callInputs: [],
                },
              ],
        [isSupportedChainId, ids]
      )
    
    [
        {methodName:"name of method for apy", callInputs:[]}
    ]

    calls.push(ids.map(id => {methodName:"", callInputs:[id]}))

    const [APY, res] = useSingleContractMultipleMethods(bondsContract, calls)
    if(!APY || !res ) return []

    return
}