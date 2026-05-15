import Decimal from 'decimal.js'

import type { OutputMode } from '@/types/damage'

export function formatByOutputMode(value: Decimal.Value, mode: OutputMode): string {
  return mode === 'unit' ? formatGameUnit(value) : formatPlainNumber(value)
}

export function formatPlainNumber(value: Decimal.Value): string {
  const decimal = toDecimal(value)

  if (!decimal.isFinite()) {
    return '-'
  }

  const absValue = decimal.abs()

  if (!absValue.isZero() && absValue.gte('1e21')) {
    return decimal.toExponential(3)
  }

  return decimal.toFixed(3)
}

export function formatScientific(value: Decimal.Value, digits = 3): string {
  const decimal = toDecimal(value)

  if (!decimal.isFinite()) {
    return '-'
  }

  return decimal.toExponential(digits)
}

export function formatGameUnit(value: Decimal.Value): string {
  const decimal = toDecimal(value)

  if (!decimal.isFinite()) {
    return '-'
  }

  const sign = decimal.isNeg() ? '-' : ''
  const absValue = decimal.abs()

  if (absValue.lt(1000)) {
    return `${sign}${absValue.toFixed(3)}`
  }

  const exponent = getBase10Exponent(absValue)
  const tier = Math.floor(exponent / 3)
  const unit = getUnitByTier(tier)
  const scaled = absValue.div(new Decimal(10).pow(tier * 3))

  return `${sign}${scaled.toFixed(3)}${unit}`
}

function toDecimal(value: Decimal.Value): Decimal {
  return value instanceof Decimal ? value : new Decimal(value)
}

function getBase10Exponent(value: Decimal): number {
  const [, exponentRaw = '0'] = value.toExponential(16).split('e')
  const exponent = Number(exponentRaw)

  if (!Number.isFinite(exponent)) {
    throw new Error('invalid exponent')
  }

  return exponent
}

function getUnitByTier(tier: number): string {
  if (tier === 1) {
    return 'K'
  }

  if (tier === 2) {
    return 'M'
  }

  if (tier === 3) {
    return 'B'
  }

  if (tier === 4) {
    return 'T'
  }

  return getLetterUnitByIndex(tier - 4)
}

function getLetterUnitByIndex(index: number): string {
  let value = index
  let result = ''

  while (value > 0) {
    value -= 1
    result = String.fromCharCode(97 + (value % 26)) + result
    value = Math.floor(value / 26)
  }

  return result
}
