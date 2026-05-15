#!/usr/bin/env node
/**
 * fix-ftywiki-decimal-js.cjs
 *
 * 用法：
 *   1. 先执行：npm install decimal.js
 *   2. 把本文件放到项目根目录，也就是 package.json 同级
 *   3. 执行：node fix-ftywiki-decimal-js.cjs
 *   4. 执行：npm run build
 *
 * 作用：
 *   - numberParser.ts 改为返回 Decimal
 *   - damageFormula.ts 全链路改为 Decimal 运算
 *   - numberFormat.ts 改为支持 Decimal 大数显示
 *   - damage.ts 的 CalcResult 数值字段改为 DecimalValue
 *   - DamageResultPanel.vue 的补充输出改为科学计数法，保留 3 位小数
 */

const fs = require('node:fs')
const path = require('node:path')

const root = process.cwd()

function fail(message) {
  console.error(`[fix-ftywiki-decimal-js] ${message}`)
  process.exit(1)
}

function ensureFile(relativePath) {
  const filePath = path.join(root, relativePath)
  if (!fs.existsSync(filePath)) {
    fail(`找不到文件：${relativePath}。请确认脚本放在项目根目录。`)
  }
  return filePath
}

function backup(filePath) {
  const backupPath = `${filePath}.bak-decimal-js`
  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(filePath, backupPath)
  }
}

function write(relativePath, content) {
  const filePath = ensureFile(relativePath)
  backup(filePath)
  fs.writeFileSync(filePath, content, 'utf8')
  console.log(`已修改：${relativePath}`)
}

function patch(relativePath, patcher) {
  const filePath = ensureFile(relativePath)
  backup(filePath)
  const before = fs.readFileSync(filePath, 'utf8')
  const after = patcher(before)
  if (before === after) {
    console.log(`无变化：${relativePath}`)
    return
  }
  fs.writeFileSync(filePath, after, 'utf8')
  console.log(`已修改：${relativePath}`)
}

ensureFile('package.json')

const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'))
if (!pkg.dependencies?.['decimal.js'] && !pkg.devDependencies?.['decimal.js']) {
  console.warn('\n警告：package.json 里没有 decimal.js。请先执行：npm install decimal.js\n')
}

write('src/utils/numberParser.ts', `import Decimal from 'decimal.js'

Decimal.set({
  precision: 80,
  rounding: Decimal.ROUND_HALF_UP,
})

export function parseExpression(input: string | undefined): Decimal {
  const source = String(input ?? '').trim()

  if (!source) {
    throw new Error('empty input')
  }

  let index = 0

  const skipSpaces = () => {
    while (index < source.length && /\\s/.test(source.charAt(index))) {
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

  const readNumberLiteral = (): string => {
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

    const exponentStart = index

    if (source.charAt(index) === 'e' || source.charAt(index) === 'E') {
      let cursor = index + 1

      if (source.charAt(cursor) === '+' || source.charAt(cursor) === '-') {
        cursor += 1
      }

      let hasExponentDigit = false

      while (cursor < source.length) {
        const char = source.charAt(cursor)

        if (char >= '0' && char <= '9') {
          hasExponentDigit = true
          cursor += 1
        } else {
          break
        }
      }

      if (hasExponentDigit) {
        index = cursor
      } else {
        index = exponentStart
      }
    }

    return source.slice(start, index)
  }

  const parseNumberWithUnit = (): Decimal => {
    skipSpaces()

    let value = new Decimal(readNumberLiteral())

    skipSpaces()

    const unit = readUnit()

    if (unit) {
      value = value.times(new Decimal(10).pow(getUnitExponent(unit)))
    }

    skipSpaces()

    if (match('%')) {
      value = value.div(100)
    }

    return value
  }

  const parsePrimary = (): Decimal => {
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

  const parseUnary = (): Decimal => {
    skipSpaces()

    if (match('+')) {
      return parseUnary()
    }

    if (match('-')) {
      return parseUnary().neg()
    }

    return parsePrimary()
  }

  const parsePower = (): Decimal => {
    let value = parseUnary()

    skipSpaces()

    if (match('^')) {
      value = value.pow(parsePower())
    }

    return value
  }

  const parseMulDiv = (): Decimal => {
    let value = parsePower()

    while (true) {
      skipSpaces()

      if (match('*')) {
        value = value.times(parsePower())
      } else if (match('/')) {
        value = value.div(parsePower())
      } else {
        break
      }
    }

    return value
  }

  function parseAddSub(): Decimal {
    let value = parseMulDiv()

    while (true) {
      skipSpaces()

      if (match('+')) {
        value = value.plus(parseMulDiv())
      } else if (match('-')) {
        value = value.minus(parseMulDiv())
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

export function ensureFinite(value: Decimal.Value): Decimal {
  const decimal = value instanceof Decimal ? value : new Decimal(value)

  if (!decimal.isFinite()) {
    throw new Error('invalid number')
  }

  return decimal
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
`)

write('src/utils/numberFormat.ts', `import Decimal from 'decimal.js'

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
    return \`\${sign}\${absValue.toFixed(3)}\`
  }

  const exponent = getBase10Exponent(absValue)
  const tier = Math.floor(exponent / 3)
  const unit = getUnitByTier(tier)
  const scaled = absValue.div(new Decimal(10).pow(tier * 3))

  return \`\${sign}\${scaled.toFixed(3)}\${unit}\`
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
`)

write('src/types/damage.ts', `import type Decimal from 'decimal.js'

export type DecimalValue = Decimal.Value

export type CalculatorType = 'base' | 'abyss'

export type OutputMode = 'number' | 'unit'

export type FieldKind = 'number' | 'ratio' | 'multiplier' | 'bonusMultiplier' | 'level'

export type FieldConfig = {
  key: string
  label: string
  defaultValue: string
  kind: FieldKind
  optional?: boolean
  placeholder?: string
}

export type CalculatorState = {
  type: CalculatorType
  values: Record<string, string>
  enabled: Record<string, boolean>
}

export type DamageCalcState = {
  activeIndex: number
  outputMode: OutputMode
  calculators: CalculatorState[]
}

export type CalcResult = {
  valid: boolean
  normalAttackDamage: DecimalValue
  critAttackDamage: DecimalValue
  normalSkillDamage: DecimalValue
  critSkillDamage: DecimalValue
  penetrationDefenseCoef: DecimalValue
  resistanceCoef: DecimalValue
  unityBonus: DecimalValue
  magicBonus: DecimalValue
  petBonus: DecimalValue
  errorMessage?: string
}

export type RuneKey = 'attack' | 'penetration' | 'critDamage' | 'blood' | 'armor'

export type RuneQualityKey = 'white' | 'green' | 'blue' | 'purple' | 'yellow' | 'red'

export type RuneQuality = {
  key: RuneQualityKey
  label: string
}

export type RuneGroup = {
  key: RuneKey
  label: string
  directKey: string
  directPlaceholder: string
}
`)

write('src/utils/damageFormula.ts', `import Decimal from 'decimal.js'

import {
  corrosionRuneValues,
  critRuneValues,
  percentRuneValues,
  runeGroups,
  runeQualities,
} from '@/constants/damageCalculator'
import type { CalculatorState, CalcResult, RuneKey, RuneQualityKey } from '@/types/damage'
import { ensureFinite, parseExpression } from '@/utils/numberParser'

const D0 = new Decimal(0)
const D1 = new Decimal(1)
const D100 = new Decimal(100)

export function calculateBaseDamage(calculator: CalculatorState): CalcResult {
  const attack = readNumber(calculator, 'attack')
  const penetration = readNumber(calculator, 'penetration')
  const critDamage = readMultiplier(calculator, 'critDamage')
  const skillRate = readMultiplier(calculator, 'skillRate')
  const enemyDefense = readNumber(calculator, 'enemyDefense')
  const ignoreDefense = readOptionalRatio(calculator, 'ignoreDefense')
  const reduceDefense = readOptionalRatio(calculator, 'reduceDefense')
  const reduceResistance = readOptionalNumber(calculator, 'reduceResistance')
  const enemyResistance = readOptionalNumber(calculator, 'enemyResistance')
  const enemyAllResistance = readOptionalNumber(calculator, 'enemyAllResistance')

  const unityBonus = calculator.enabled.unityLevel
    ? new Decimal('1.05').pow(readLevel(calculator, 'unityLevel'))
    : D1
  const magicBonus = calculator.enabled.magicLevel
    ? calculateMagicBonus(readLevel(calculator, 'magicLevel'))
    : D1
  const petBonus = calculator.enabled.petBonusDirect
    ? readOptionalBonusMultiplier(calculator, 'petBonusDirect')
    : calculator.enabled.petLevel
      ? new Decimal('1.01').pow(readLevel(calculator, 'petLevel'))
      : D1
  const mechBonus = readOptionalBonusMultiplier(calculator, 'mechBonus')
  const skinBonus = readOptionalBonusMultiplier(calculator, 'skinBonus')
  const guildPenBonus = readOptionalBonusMultiplier(calculator, 'guildPenBonus')
  const guildCritBonus = readOptionalBonusMultiplier(calculator, 'guildCritBonus')
  const mainAttackBuff = readOptionalBonusMultiplier(calculator, 'mainAttackBuff')

  const finalAttack = attack.times(mainAttackBuff)
  const finalCritDamage = critDamage.times(guildCritBonus)
  const finalPenetration = penetration.times(guildPenBonus)
  const finalEnemyDefense = enemyDefense.times(D1.minus(ignoreDefense)).times(D1.minus(reduceDefense))
  const penetrationDefenseCoef = calculatePenetrationDefenseCoef(finalPenetration, finalEnemyDefense)
  const finalResistance = enemyResistance.plus(enemyAllResistance).minus(reduceResistance)
  const resistanceCoef = calculateResistanceCoef(finalResistance)
  const otherMultiplier = unityBonus.times(magicBonus).times(petBonus).times(mechBonus).times(skinBonus)

  return createValidResult({
    finalAttack,
    finalCritDamage,
    skillRate,
    penetrationDefenseCoef,
    resistanceCoef,
    otherMultiplier,
    unityBonus,
    magicBonus,
    petBonus,
  })
}

export function calculateAbyssDamage(calculator: CalculatorState): CalcResult {
  const attack = readNumber(calculator, 'attack')
  const penetration = readNumber(calculator, 'penetration')
  const critDamage = readMultiplier(calculator, 'critDamage')
  const skillRate = readMultiplier(calculator, 'skillRate')
  const enemyDefense = readNumber(calculator, 'enemyDefense')
  const ignoreDefense = readOptionalRatio(calculator, 'ignoreDefense')
  const reduceDefense = readOptionalRatio(calculator, 'reduceDefense')
  const reduceResistance = readOptionalNumber(calculator, 'reduceResistance')
  const enemyResistance = readOptionalNumber(calculator, 'enemyResistance')

  const attackRuneBonus = D1.plus(readRuneValue(calculator, 'attack'))
  const penetrationRuneBonus = D1.plus(readRuneValue(calculator, 'penetration'))
  const critRuneBonus = D1.plus(readRuneValue(calculator, 'critDamage'))
  const bloodRuneValue = readRuneValue(calculator, 'blood')
  const armorRuneValue = readRuneValue(calculator, 'armor')

  const armorRuneCoef = Decimal.min(
    D1.minus(new Decimal('0.2').pow(armorRuneValue.div(600))),
    new Decimal('0.8'),
  )
  const bloodRuneCoef = Decimal.min(
    D1.minus(new Decimal('0.2').pow(bloodRuneValue.div(600))),
    new Decimal('0.8'),
  )
  const petBonus = calculator.enabled.petBonusDirect
    ? readOptionalBonusMultiplier(calculator, 'petBonusDirect')
    : calculator.enabled.petLevel
      ? new Decimal('1.01').pow(readLevel(calculator, 'petLevel'))
      : D1

  const finalAttack = attack.times(attackRuneBonus)
  const finalCritDamage = critDamage.times(critRuneBonus)
  const finalPenetration = penetration.times(penetrationRuneBonus)
  const finalEnemyDefense = enemyDefense
    .times(D1.minus(ignoreDefense))
    .times(D1.minus(reduceDefense))
    .times(D1.minus(armorRuneCoef))
  const penetrationDefenseCoef = calculatePenetrationDefenseCoef(finalPenetration, finalEnemyDefense)
  const resistanceCoef = calculateResistanceCoef(enemyResistance.minus(reduceResistance))
  const bloodBonus = D1.div(D1.minus(bloodRuneCoef))
  const otherMultiplier = petBonus.times(bloodBonus)

  return createValidResult({
    finalAttack,
    finalCritDamage,
    skillRate,
    penetrationDefenseCoef,
    resistanceCoef,
    otherMultiplier,
    unityBonus: D1,
    magicBonus: D1,
    petBonus,
  })
}

export function createInvalidResult(errorMessage = ''): CalcResult {
  return {
    valid: false,
    normalAttackDamage: D0,
    critAttackDamage: D0,
    normalSkillDamage: D0,
    critSkillDamage: D0,
    penetrationDefenseCoef: D0,
    resistanceCoef: D0,
    unityBonus: D0,
    magicBonus: D0,
    petBonus: D0,
    errorMessage,
  }
}

export function getRuneCountKey(runeKey: RuneKey, qualityKey: RuneQualityKey): string {
  return \`rune_\${runeKey}_\${qualityKey}\`
}

function createValidResult(params: {
  finalAttack: Decimal
  finalCritDamage: Decimal
  skillRate: Decimal
  penetrationDefenseCoef: Decimal
  resistanceCoef: Decimal
  otherMultiplier: Decimal
  unityBonus?: Decimal
  magicBonus?: Decimal
  petBonus?: Decimal
}): CalcResult {
  const {
    finalAttack,
    finalCritDamage,
    skillRate,
    penetrationDefenseCoef,
    resistanceCoef,
    otherMultiplier,
    unityBonus = D1,
    magicBonus = D1,
    petBonus = D1,
  } = params

  const baseDamage = finalAttack
    .times(penetrationDefenseCoef)
    .times(resistanceCoef)
    .times(otherMultiplier)

  return {
    valid: true,
    normalAttackDamage: baseDamage,
    critAttackDamage: baseDamage.times(finalCritDamage),
    normalSkillDamage: baseDamage.times(skillRate),
    critSkillDamage: baseDamage.times(finalCritDamage).times(skillRate),
    penetrationDefenseCoef,
    resistanceCoef,
    unityBonus,
    magicBonus,
    petBonus,
  }
}

function calculatePenetrationDefenseCoef(finalPenetration: Decimal, finalDefense: Decimal): Decimal {
  if (finalDefense.lt(0)) {
    throw new Error('invalid defense')
  }

  if (finalPenetration.gte(finalDefense)) {
    return D1.plus(new Decimal('0.01').times(finalPenetration.minus(finalDefense).sqrt()))
  }

  return D1.div(D1.plus(new Decimal('0.01').times(finalDefense.minus(finalPenetration))))
}

function calculateResistanceCoef(resistance: Decimal): Decimal {
  const points = [
    { value: '-75', coef: '0.535' },
    { value: '-50', coef: '0.636' },
    { value: '-25', coef: '0.784' },
    { value: '-20', coef: '0.821' },
    { value: '0', coef: '1' },
    { value: '20', coef: '1.179' },
    { value: '25', coef: '1.216' },
    { value: '50', coef: '1.364' },
    { value: '75', coef: '1.465' },
  ]

  const normalizedResistance = normalizeDecimal(resistance)
  const point = points.find((item) => item.value === normalizedResistance)

  if (!point) {
    throw new Error('当前属性抵抗修正系数未知，请输入正确属性抵抗')
  }

  return new Decimal(point.coef)
}

function normalizeDecimal(value: Decimal): string {
  return value.toDecimalPlaces(12).toString()
}

function calculateMagicBonus(level: Decimal): Decimal {
  const group = level.div(50).floor()
  const rest = level.mod(50)
  const groupMultiplier = new Decimal('1.2').pow(group)
  const addition = new Decimal('12.5')
    .times(groupMultiplier.minus(1))
    .plus(new Decimal('0.05').times(rest).times(groupMultiplier))

  return D1.plus(addition)
}

function readNumber(calculator: CalculatorState, key: string): Decimal {
  return ensureFinite(parseExpression(calculator.values[key]))
}

function readOptionalNumber(calculator: CalculatorState, key: string): Decimal {
  if (!calculator.enabled[key]) {
    return D0
  }

  return readNumber(calculator, key)
}

function readMultiplier(calculator: CalculatorState, key: string): Decimal {
  const value = ensureFinite(parseExpression(calculator.values[key]))

  if (value.lt(0)) {
    throw new Error('invalid multiplier')
  }

  return value
}

function readOptionalBonusMultiplier(calculator: CalculatorState, key: string): Decimal {
  if (!calculator.enabled[key]) {
    return D1
  }

  const raw = calculator.values[key] ?? ''
  const parsed = ensureFinite(parseExpression(raw))
  const value = raw.includes('%') ? D1.plus(parsed) : parsed

  if (value.lt(0)) {
    throw new Error('invalid bonus multiplier')
  }

  return value
}

function readOptionalRatio(calculator: CalculatorState, key: string): Decimal {
  if (!calculator.enabled[key]) {
    return D0
  }

  const raw = calculator.values[key] ?? ''
  const parsed = ensureFinite(parseExpression(raw))
  const value = raw.includes('%') ? parsed : parsed.gt(1) ? parsed.div(D100) : parsed

  if (value.lt(0) || value.gt(1)) {
    throw new Error('invalid ratio')
  }

  return value
}

function readLevel(calculator: CalculatorState, key: string): Decimal {
  const value = ensureFinite(parseExpression(calculator.values[key]))

  if (value.lt(0) || !value.isInteger()) {
    throw new Error('invalid level')
  }

  return value
}

function readRuneValue(calculator: CalculatorState, runeKey: RuneKey): Decimal {
  const rune = runeGroups.find((item) => item.key === runeKey)

  if (!rune) {
    throw new Error('invalid rune')
  }

  const directValue = (calculator.values[rune.directKey] ?? '').trim()

  if (directValue) {
    const value = ensureFinite(parseExpression(directValue))

    if (value.lt(0)) {
      throw new Error('invalid rune value')
    }

    return value
  }

  let total = D0

  for (const quality of runeQualities) {
    const countRaw = calculator.values[getRuneCountKey(runeKey, quality.key)] ?? '0'
    const count = ensureFinite(parseExpression(countRaw))

    if (count.lt(0) || !count.isInteger()) {
      throw new Error('invalid rune count')
    }

    if (runeKey === 'attack' || runeKey === 'penetration') {
      total = total.plus(count.times(percentRuneValues[quality.key]))
    } else if (runeKey === 'critDamage') {
      total = total.plus(count.times(critRuneValues[quality.key]))
    } else {
      total = total.plus(count.times(corrosionRuneValues[quality.key]))
    }
  }

  return total
}
`)

patch('src/components/damage-calc/DamageResultPanel.vue', (source) => {
  let next = source

  next = next.replace(
    /import type \{ CalculatorType, CalcResult, OutputMode \} from '@\/types\/damage'/,
    "import type { CalculatorType, CalcResult, DecimalValue, OutputMode } from '@/types/damage'",
  )

  next = next.replace(
    /import \{ formatByOutputMode, formatPlainNumber \} from '@\/utils\/numberFormat'/,
    "import { formatByOutputMode, formatScientific } from '@/utils/numberFormat'",
  )

  next = next.replace(/function formatDamage\(value: number\): string \{/, 'function formatDamage(value: DecimalValue): string {')
  next = next.replace(/function formatSupplement\(value: number\): string \{/, 'function formatSupplement(value: DecimalValue): string {')
  next = next.replace(/return formatPlainNumber\(value\)/, 'return formatScientific(value, 3)')

  return next
})

console.log('\n完成。下一步执行：')
console.log('  npm install decimal.js')
console.log('  npm run build')
console.log('\n如果构建失败，把完整报错发给我。备份文件后缀：.bak-decimal-js')
