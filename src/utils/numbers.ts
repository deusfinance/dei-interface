import BigNumber from 'bignumber.js'
import numbro from 'numbro'

BigNumber.config({ EXPONENTIAL_AT: 30 })

export const BN_ZERO: BigNumber = toBN('0')
export const BN_ONE: BigNumber = toBN('1')
export const BN_TEN: BigNumber = toBN('10')

export function toBN(num: BigNumber.Value): BigNumber {
  return new BigNumber(num)
}

export function removeTrailingZeros(num: BigNumber.Value): string {
  return toBN(num).toString()
  // return str.replace(/\.?0+$/, '')
}

export const formatBalance = (balance: BigNumber.Value, fixed = 6): string => {
  const bnBalance = toBN(balance)
  if (
    toBN(10)
      .pow(fixed - 1)
      .lte(bnBalance)
  ) {
    return bnBalance.toFormat(0, BigNumber.ROUND_DOWN)
  }
  return bnBalance.sd(fixed, BigNumber.ROUND_DOWN).toFormat()
}

export const formatDollarAmount = (num: number | undefined, digits = 2, round = true) => {
  if (num === 0) return '$0.00'
  if (!num) return '-'
  if (num < 0.001 && digits <= 3) {
    return '<$0.001'
  }

  return numbro(num).formatCurrency({
    average: round,
    mantissa: num > 1000 ? 2 : digits,
    abbreviations: {
      million: 'M',
      billion: 'B',
    },
  })
}

export const formatAmount = (num: number | undefined, digits = 2, thousandSeparated?: boolean) => {
  if (num === 0) return '0'
  if (!num) return '-'
  if (num < 0.001) {
    return '<0.001'
  }
  return numbro(num).format({
    thousandSeparated: !!thousandSeparated,
    average: !thousandSeparated,
    mantissa: num > 1000 ? 2 : digits,
    abbreviations: {
      million: 'M',
      billion: 'B',
    },
  })
}
