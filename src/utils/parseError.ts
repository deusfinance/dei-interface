function getErrorState(error: any): string | undefined {
  let reason: string | undefined
  let message: string | undefined

  while (Boolean(error)) {
    reason = error.reason ?? error.message ?? reason
    message = error.data.message ?? message
    error = error.error ?? error.data?.originalError
  }
  reason = message ?? reason
  if (reason?.indexOf('execution reverted: ') === 0) reason = reason.substr('execution reverted: '.length)
  return reason
}

export function RedeemError(error: any): string | null {
  const reason = getErrorState(error)

  switch (reason) {
    case 'ds-math-sub-underflow':
      return 'Your input amount is very high. Try decreasing your input amount.'
    default:
      if (reason?.indexOf('undefined is not an object') !== -1) {
        console.error(error, reason)
        return `An error occurred when trying to execute this swap. You may need to increase your slippage tolerance. If that does not work, there may be an incompatibility with the token you are trading. Note fee on transfer and rebase tokens are incompatible with Uniswap V3.`
      }
      return `${reason ? `"${reason}"` : ''}.`
  }
}

//TODO: get All error and make a readable message here
export function MintErrorToUserReadableMessage(error: any): string {
  let reason: string | undefined

  while (Boolean(error)) {
    reason = error.reason ?? error.message ?? reason
    error = error.error ?? error.data?.originalError
  }

  if (reason?.indexOf('execution reverted: ') === 0) reason = reason.substr('execution reverted: '.length)
  return `Unknown error${reason ? `: "${reason}"` : ''}. Try increasing your slippage tolerance.`
}
