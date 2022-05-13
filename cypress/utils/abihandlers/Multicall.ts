import { FAKE_BLOCK_HASH } from '../fake_tx_data'
import { decodeEthCall, encodeEthResult } from '../abiutils'
import MULTICALL2_ABI from '../../../src/constants/abi/MULTICALL2.json'

function isTheSameAddress(address1: string, address2: string) {
  return address1.toLowerCase() === address2.toLowerCase()
}

export class BaseMulticallHandler {
  async tryBlockAndAggregate(context: any, decodedInput: any[]) {
    const [_requireSuccess, calls] = decodedInput
    const results: any[] = []
    for (const call of calls) {
      const [callAddress, callInput] = call
      for (const contractAddress in context.handlers) {
        if (isTheSameAddress(contractAddress, callAddress)) {
          const { abi, handler } = context.handlers[contractAddress]
          const decoded = decodeEthCall(abi, callInput)
          if (handler[decoded.method]) {
            const res = await handler[decoded.method](context, decoded.inputs)
            results.push([true, encodeEthResult(abi, decoded.method, res)])
          }
        }
      }
    }
    return [0, FAKE_BLOCK_HASH, results]
  }
}

export const getMulticallHandler = () => ({
  abi: MULTICALL2_ABI,
  handler: new BaseMulticallHandler(),
})
