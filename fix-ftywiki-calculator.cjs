const fs = require('node:fs')
const path = require('node:path')

const projectRoot = process.cwd()

function filePath(relativePath) {
  return path.join(projectRoot, relativePath)
}

function read(relativePath) {
  const fullPath = filePath(relativePath)
  if (!fs.existsSync(fullPath)) {
    throw new Error(`找不到文件：${relativePath}。请在项目根目录运行此脚本。`)
  }
  return fs.readFileSync(fullPath, 'utf8')
}

function write(relativePath, content) {
  fs.writeFileSync(filePath(relativePath), content)
}

function removeRegex(content, regex, label, notes) {
  if (!regex.test(content)) {
    notes.push(`跳过：${label}，可能已经处理过。`)
    return content
  }
  return content.replace(regex, '')
}

function replaceRegex(content, regex, replacement, label, notes) {
  if (!regex.test(content)) {
    notes.push(`跳过：${label}，可能已经处理过，或本地代码和仓库版本不同。`)
    return content
  }
  return content.replace(regex, replacement)
}

function updateDamageInputGrid() {
  const relativePath = 'src/components/damage-calc/DamageInputGrid.vue'
  let content = read(relativePath)
  const notes = []

  content = removeRegex(
    content,
    /\r?\n\s*<span\s+v-if="field\.optional"\s+class="optional-mark">\*<\/span>/,
    '删除输入项名称后面的 *',
    notes,
  )

  content = removeRegex(
    content,
    /\r?\n\.optional-mark\s*\{\s*\r?\n\s*color:\s*#ff4d4f;\s*\r?\n\}/,
    '删除 optional-mark 样式',
    notes,
  )

  write(relativePath, content)
  return { relativePath, notes }
}

function updateDamageCalculatorConstants() {
  const relativePath = 'src/constants/damageCalculator.ts'
  let content = read(relativePath)
  const notes = []

  if (/export const abyssFields: FieldConfig\[\] = \[([\s\S]*?)key:\s*'petLevel',[\s\S]*?label:\s*'宠物等级',[\s\S]*?optional:\s*true,[\s\S]*?key:\s*'petBonusDirect'/.test(content)) {
    notes.push('跳过：深渊宠物等级已经是可开关字段。')
  } else {
    content = replaceRegex(
      content,
      /(export const abyssFields: FieldConfig\[\] = \[[\s\S]*?\{\s*\r?\n\s*key:\s*'petLevel',\s*\r?\n\s*label:\s*'宠物等级',\s*\r?\n\s*defaultValue:\s*'0',\s*\r?\n\s*kind:\s*'level',\s*\r?\n)(\s*\},\s*\r?\n\s*\{\s*\r?\n\s*key:\s*'petBonusDirect')/,
      `$1    optional: true,\n$2`,
      '把深渊宠物等级改为可开关字段',
      notes,
    )
  }

  write(relativePath, content)
  return { relativePath, notes }
}

function updateUseDamageCalculator() {
  const relativePath = 'src/composables/useDamageCalculator.ts'
  let content = read(relativePath)
  const notes = []

  if (!content.includes('function disableExclusivePetField')) {
    content = replaceRegex(
      content,
      /function setFieldEnabled\(key: string, enabled: boolean\) \{\s*\r?\n\s*activeCalculator\.value\.enabled\[key\] = enabled\s*\r?\n\s*\}/,
      `function setFieldEnabled(key: string, enabled: boolean) {\n  if (enabled) {\n    disableExclusivePetField(activeCalculator.value, key)\n  }\n  activeCalculator.value.enabled[key] = enabled\n}`,
      '让宠物等级和宠物加成开关互斥',
      notes,
    )
  } else {
    notes.push('跳过：互斥开关函数已经存在。')
  }

  if (!/function setCalculatorType[\s\S]*normalizePetBonusEnabled\(activeCalculator\.value\)/.test(content)) {
    content = replaceRegex(
      content,
      /function setCalculatorType\(type: CalculatorType\) \{\s*\r?\n\s*activeCalculator\.value\.type = type\s*\r?\n\s*\}/,
      `function setCalculatorType(type: CalculatorType) {\n    activeCalculator.value.type = type\n    if (type === 'abyss' && !activeCalculator.value.enabled.petBonusDirect) {\n      activeCalculator.value.enabled.petLevel = true\n    }\n    normalizePetBonusEnabled(activeCalculator.value)\n  }`,
      '切换计算器类型后规范宠物字段启用状态',
      notes,
    )
  } else {
    notes.push('跳过：切换计算器类型时已经会规范宠物字段。')
  }

  if (!/message\.success\('已粘贴可用参数'\)/.test(content)) {
    notes.push('跳过：没有找到粘贴成功提示。')
  } else if (!/normalizePetBonusEnabled\(activeCalculator\.value\)\s*\r?\n\s*message\.success\('已粘贴可用参数'\)/.test(content)) {
    content = content.replace(
      /\r?\n\s*message\.success\('已粘贴可用参数'\)/,
      `\n    normalizePetBonusEnabled(activeCalculator.value)\n    message.success('已粘贴可用参数')`,
    )
  } else {
    notes.push('跳过：粘贴参数后已经会规范宠物字段。')
  }

  if (!/if \(type === 'abyss'\) \{\s*\r?\n\s*enabled\.petLevel = true\s*\r?\n\s*enabled\.petBonusDirect = false/.test(content)) {
    content = replaceRegex(
      content,
      /(for \(const rune of runeGroups\) \{[\s\S]*?\n\s*\}\s*\r?\n)(\s*return \{\s*\r?\n\s*type,)/,
      `$1\n  if (type === 'abyss') {\n    enabled.petLevel = true\n    enabled.petBonusDirect = false\n  }\n\n$2`,
      '设置深渊计算器默认启用宠物等级',
      notes,
    )
  } else {
    notes.push('跳过：深渊默认宠物字段状态已经设置。')
  }

  if (!/normalizePetBonusEnabled\(calculator\)\s*\r?\n\s*return calculator/.test(content)) {
    content = replaceRegex(
      content,
      /(if \(input\?\.enabled\) \{[\s\S]*?\n\s*\}\s*\r?\n)(\s*return calculator)/,
      `$1  normalizePetBonusEnabled(calculator)\n$2`,
      '读取本地缓存后规范宠物字段启用状态',
      notes,
    )
  } else {
    notes.push('跳过：读取缓存后已经会规范宠物字段。')
  }

  if (!content.includes('function normalizePetBonusEnabled')) {
    content = replaceRegex(
      content,
      /\r?\nfunction getAvailableKeys\(type: CalculatorType\): string\[\] \{/,
      `\nfunction disableExclusivePetField(calculator: CalculatorState, key: string) {\n  if (key === 'petLevel') {\n    calculator.enabled.petBonusDirect = false\n  }\n\n  if (key === 'petBonusDirect') {\n    calculator.enabled.petLevel = false\n  }\n}\n\nfunction normalizePetBonusEnabled(calculator: CalculatorState) {\n  if (calculator.enabled.petBonusDirect) {\n    calculator.enabled.petLevel = false\n  }\n}\n\nfunction getAvailableKeys(type: CalculatorType): string[] {`,
      '添加宠物字段互斥辅助函数',
      notes,
    )
  } else {
    notes.push('跳过：宠物字段规范化函数已经存在。')
  }

  write(relativePath, content)
  return { relativePath, notes }
}

function updateDamageFormula() {
  const relativePath = 'src/utils/damageFormula.ts'
  let content = read(relativePath)
  const notes = []

  content = replaceRegex(
    content,
    /const petBonus = calculator\.enabled\.petBonusDirect\s*\r?\n\s*\? readOptionalBonusMultiplier\(calculator, 'petBonusDirect'\)\s*\r?\n\s*: Math\.pow\(1\.01, readLevel\(calculator, 'petLevel'\)\)/,
    `const petBonus = calculator.enabled.petBonusDirect\n    ? readOptionalBonusMultiplier(calculator, 'petBonusDirect')\n    : calculator.enabled.petLevel\n      ? Math.pow(1.01, readLevel(calculator, 'petLevel'))\n      : 1`,
    '深渊公式中仅在启用宠物等级时读取宠物等级',
    notes,
  )

  write(relativePath, content)
  return { relativePath, notes }
}

function main() {
  const results = [
    updateDamageInputGrid(),
    updateDamageCalculatorConstants(),
    updateUseDamageCalculator(),
    updateDamageFormula(),
  ]

  console.log('修改完成。涉及文件：')
  for (const result of results) {
    console.log(`- ${result.relativePath}`)
    for (const note of result.notes) {
      console.log(`  ${note}`)
    }
  }
  console.log('\n建议继续执行：')
  console.log('npm run build')
}

main()
