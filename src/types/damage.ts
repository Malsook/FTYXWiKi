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
  normalAttackDamage: number
  critAttackDamage: number
  normalSkillDamage: number
  critSkillDamage: number
  penetrationDefenseCoef: number
  resistanceCoef: number
  unityBonus: number
  magicBonus: number
  petBonus: number
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
