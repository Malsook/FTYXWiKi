#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const root = process.cwd()

const FILES = {
  resultPanel: 'src/components/damage-calc/DamageResultPanel.vue',
  damageFormula: 'src/utils/damageFormula.ts',
  damageTypes: 'src/types/damage.ts',
  calculatorComposable: 'src/composables/useDamageCalculator.ts',
}

function filePath(relativePath) {
  return path.join(root, relativePath)
}

function read(relativePath) {
  const target = filePath(relativePath)
  if (!fs.existsSync(target)) {
    throw new Error(`找不到文件：${relativePath}。请确认脚本放在项目根目录执行。`)
  }
  return fs.readFileSync(target, 'utf8')
}

function write(relativePath, content) {
  const target = filePath(relativePath)
  const backup = `${target}.bak-result-resistance`
  if (!fs.existsSync(backup)) {
    fs.copyFileSync(target, backup)
  }
  fs.writeFileSync(target, content)
}

function replaceOrThrow(content, pattern, replacement, description) {
  const next = content.replace(pattern, replacement)
  if (next === content) {
    throw new Error(`未能修改：${description}`)
  }
  return next
}

function updateDamageResultPanel() {
  let content = read(FILES.resultPanel)

  content = content.replace(
    /import \{ formatByOutputMode,\s*formatPlainNumber \} from '@\/utils\/numberFormat'/,
    "import { formatByOutputMode } from '@/utils/numberFormat'",
  )

  if (!content.includes('class="result-error-alert"')) {
    content = replaceOrThrow(
      content,
      /(<a-card title="计算结果" class="result-card" size="small">\r?\n)/,
      `$1  <a-alert\n    v-if="!result.valid && result.errorMessage"\n    class="result-error-alert"\n    type="warning"\n    show-icon\n    :message="result.errorMessage"\n  />\n`,
      '在计算结果卡片中加入错误提示',
    )
  }

  if (!content.includes('function formatScientificNumber')) {
    content = replaceOrThrow(
      content,
      /function formatSupplement\(value: number\): string \{/,
      `function formatScientificNumber(value: number): string {\n  if (!Number.isFinite(value)) {\n    return '-'\n  }\n\n  return value.toExponential(3)\n}\n\nfunction formatSupplement(value: number): string {`,
      '加入科学计数法格式化函数',
    )
  }

  content = content.replace(/return formatPlainNumber\(value\)/g, 'return formatScientificNumber(value)')

  if (!content.includes('.result-error-alert')) {
    content = replaceOrThrow(
      content,
      /(\.damage-result-grid \{)/,
      `.result-error-alert {\n  margin-bottom: 10px;\n}\n\n$1`,
      '加入错误提示样式',
    )
  }

  write(FILES.resultPanel, content)
}

function updateDamageTypes() {
  let content = read(FILES.damageTypes)

  if (!content.includes('errorMessage?: string')) {
    content = replaceOrThrow(
      content,
      /(\s+petBonus: number\r?\n)(\s*})/,
      `$1\n  errorMessage?: string\n$2`,
      '为 CalcResult 加入 errorMessage 字段',
    )
  }

  write(FILES.damageTypes, content)
}

function updateCalculatorComposable() {
  let content = read(FILES.calculatorComposable)

  if (!content.includes('createInvalidResult(errorMessage)')) {
    content = replaceOrThrow(
      content,
      /}\s*catch\s*\{\s*return createInvalidResult\(\)\s*}/,
      `} catch (error) {\n      const errorMessage = error instanceof Error ? error.message : '计算参数无效'\n      return createInvalidResult(errorMessage)\n    }`,
      '把计算错误信息传给结果面板',
    )
  }

  write(FILES.calculatorComposable, content)
}

function updateDamageFormula() {
  let content = read(FILES.damageFormula)

  content = content.replace(
    /export function createInvalidResult\(\): CalcResult \{/,
    "export function createInvalidResult(errorMessage = ''): CalcResult {",
  )

  if (!/export function createInvalidResult[\s\S]*?errorMessage,/.test(content)) {
    content = replaceOrThrow(
      content,
      /(export function createInvalidResult[\s\S]*?\s+petBonus: 0,\r?\n)(\s*})/,
      `$1    errorMessage,\n$2`,
      '无效结果中加入 errorMessage',
    )
  }

  const exactResistanceFunction = `function calculateResistanceCoef(resistance: number): number {\n  const points = [\n    { value: -75, coef: 0.535 },\n    { value: -50, coef: 0.636 },\n    { value: -25, coef: 0.784 },\n    { value: -20, coef: 0.821 },\n    { value: 0, coef: 1 },\n    { value: 20, coef: 1.179 },\n    { value: 25, coef: 1.216 },\n    { value: 50, coef: 1.364 },\n    { value: 75, coef: 1.465 },\n  ]\n\n  const normalizedResistance = normalizeDecimal(resistance)\n  const point = points.find((item) => item.value === normalizedResistance)\n\n  if (!point) {\n    throw new Error('当前属性抵抗修正系数未知，请输入正确属性抵抗')\n  }\n\n  return point.coef\n}\n\nfunction normalizeDecimal(value: number): number {\n  return Number(value.toFixed(12))\n}\n\nfunction calculateMagicBonus`

  if (!content.includes('normalizedResistance')) {
    content = replaceOrThrow(
      content,
      /function calculateResistanceCoef\(resistance: number\): number \{[\s\S]*?\r?\n}\r?\n\r?\nfunction calculateMagicBonus/,
      exactResistanceFunction,
      '把属性抵抗修正系数改为精确匹配，不再线性补充',
    )
  }

  write(FILES.damageFormula, content)
}

function main() {
  updateDamageResultPanel()
  updateDamageTypes()
  updateCalculatorComposable()
  updateDamageFormula()

  console.log('修改完成。建议执行：')
  console.log('  npm run build')
  console.log('如需回滚，可使用同目录下的 .bak-result-resistance 备份文件。')
}

try {
  main()
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
}
