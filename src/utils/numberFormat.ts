import type { OutputMode } from '@/types/damage'

export function formatByOutputMode(value: number, mode: OutputMode): string {
  return mode === 'unit' ? formatGameUnit(value) : formatPlainNumber(value)
}

export function formatPlainNumber(value: number): string {
  if (!Number.isFinite(value)) {
    return '-'
  }

  return value.toLocaleString('en-US', {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  })
}

export function formatGameUnit(value: number): string {
  if (!Number.isFinite(value)) {
    return '-'
  }

  const sign = value < 0 ? '-' : ''
  const absValue = Math.abs(value)

  if (absValue < 1000) {
    return `${sign}${absValue.toFixed(3)}`
  }

  const tier = Math.floor(Math.log10(absValue) / 3)
  const unit = getUnitByTier(tier)
  const scaled = absValue / Math.pow(10, tier * 3)

  return `${sign}${scaled.toFixed(3)}${unit}`
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
