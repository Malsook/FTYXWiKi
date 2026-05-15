export function parseExpression(input: string | undefined): number {
  const source = String(input ?? '').trim()

  if (!source) {
    throw new Error('empty input')
  }

  let index = 0

  const skipSpaces = () => {
    while (index < source.length && /\s/.test(source.charAt(index))) {
      index += 1
    }
  }

  const match = (char: string): boolean => {
    if (source.charAt(index) === char) {
      index += 1
      return true
    }

    return false
  }

  const readUnit = (): string => {
    if (index >= source.length) {
      return ''
    }

    const upperUnit = source.charAt(index)

    if (upperUnit === 'K' || upperUnit === 'M' || upperUnit === 'B' || upperUnit === 'T') {
      index += 1
      return upperUnit
    }

    const start = index

    while (index < source.length) {
      const char = source.charAt(index)

      if (char >= 'a' && char <= 'z') {
        index += 1
      } else {
        break
      }
    }

    return source.slice(start, index)
  }

  const parseNumberWithUnit = (): number => {
    skipSpaces()

    const start = index
    let hasDot = false
    let hasDigit = false

    while (index < source.length) {
      const char = source.charAt(index)

      if (char >= '0' && char <= '9') {
        hasDigit = true
        index += 1
      } else if (char === '.' && !hasDot) {
        hasDot = true
        index += 1
      } else {
        break
      }
    }

    if (!hasDigit) {
      throw new Error('missing number')
    }

    let value = Number(source.slice(start, index))

    skipSpaces()

    const unit = readUnit()

    if (unit) {
      value *= Math.pow(10, getUnitExponent(unit))
    }

    skipSpaces()

    if (match('%')) {
      value /= 100
    }

    return value
  }

  const parsePrimary = (): number => {
    skipSpaces()

    if (match('(')) {
      const value = parseAddSub()
      skipSpaces()

      if (!match(')')) {
        throw new Error('missing right parenthesis')
      }

      return value
    }

    return parseNumberWithUnit()
  }

  const parseUnary = (): number => {
    skipSpaces()

    if (match('+')) {
      return parseUnary()
    }

    if (match('-')) {
      return -parseUnary()
    }

    return parsePrimary()
  }

  const parsePower = (): number => {
    let value = parseUnary()

    skipSpaces()

    if (match('^')) {
      value = Math.pow(value, parsePower())
    }

    return value
  }

  const parseMulDiv = (): number => {
    let value = parsePower()

    while (true) {
      skipSpaces()

      if (match('*')) {
        value *= parsePower()
      } else if (match('/')) {
        value /= parsePower()
      } else {
        break
      }
    }

    return value
  }

  function parseAddSub(): number {
    let value = parseMulDiv()

    while (true) {
      skipSpaces()

      if (match('+')) {
        value += parseMulDiv()
      } else if (match('-')) {
        value -= parseMulDiv()
      } else {
        break
      }
    }

    return value
  }

  const result = parseAddSub()

  skipSpaces()

  if (index !== source.length) {
    throw new Error('unexpected token')
  }

  return result
}

export function ensureFinite(value: number): number {
  if (!Number.isFinite(value)) {
    throw new Error('invalid number')
  }

  return value
}

function getUnitExponent(unit: string): number {
  if (unit === 'K') {
    return 3
  }

  if (unit === 'M') {
    return 6
  }

  if (unit === 'B') {
    return 9
  }

  if (unit === 'T') {
    return 12
  }

  if (!/^[a-z]+$/.test(unit)) {
    throw new Error('invalid unit')
  }

  let unitIndex = 0

  for (const char of unit) {
    unitIndex = unitIndex * 26 + (char.charCodeAt(0) - 96)
  }

  return 12 + unitIndex * 3
}
