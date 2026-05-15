import type { FieldConfig, RuneGroup, RuneQuality, RuneQualityKey } from '@/types/damage'

export const STORAGE_KEY = 'airship-hero-wiki-damage-calc-v3'

export const baseFields: FieldConfig[] = [
  {
    key: 'attack',
    label: '攻击力',
    defaultValue: '0',
    kind: 'number',
    placeholder: '100M',
  },
  {
    key: 'penetration',
    label: '穿透',
    defaultValue: '0',
    kind: 'number',
    placeholder: '100M',
  },
  {
    key: 'critDamage',
    label: '暴伤',
    defaultValue: '1',
    kind: 'multiplier',
    placeholder: '2 或 200%',
  },
  {
    key: 'skillRate',
    label: '技能倍率',
    defaultValue: '1',
    kind: 'multiplier',
    placeholder: '3.5 或 350%',
  },
  {
    key: 'ignoreDefense',
    label: '无视防御系数',
    defaultValue: '0',
    kind: 'ratio',
    optional: true,
    placeholder: '0.2 或 20%',
  },
  {
    key: 'reduceDefense',
    label: '降低防御系数',
    defaultValue: '0',
    kind: 'ratio',
    optional: true,
    placeholder: '0.2 或 20%',
  },
  {
    key: 'reduceResistance',
    label: '属性抵抗降低值',
    defaultValue: '0',
    kind: 'number',
    optional: true,
  },
  {
    key: 'unityLevel',
    label: '团结等级',
    defaultValue: '0',
    kind: 'level',
    optional: true,
  },
  {
    key: 'magicLevel',
    label: '魔力等级',
    defaultValue: '0',
    kind: 'level',
    optional: true,
  },
  {
    key: 'petLevel',
    label: '宠物等级',
    defaultValue: '0',
    kind: 'level',
    optional: true,
  },
  {
    key: 'petBonusDirect',
    label: '宠物加成',
    defaultValue: '1',
    kind: 'bonusMultiplier',
    optional: true,
    placeholder: '1.5 或 50%',
  },
  {
    key: 'mechBonus',
    label: '机械精灵加成',
    defaultValue: '1',
    kind: 'bonusMultiplier',
    optional: true,
    placeholder: '1.2 或 20%',
  },
  {
    key: 'skinBonus',
    label: '飞艇皮肤加成',
    defaultValue: '1',
    kind: 'bonusMultiplier',
    optional: true,
    placeholder: '1.2 或 20%',
  },
  {
    key: 'guildPenBonus',
    label: '公会穿透加成',
    defaultValue: '1',
    kind: 'bonusMultiplier',
    optional: true,
    placeholder: '1.2 或 20%',
  },
  {
    key: 'guildCritBonus',
    label: '公会暴伤加成',
    defaultValue: '1',
    kind: 'bonusMultiplier',
    optional: true,
    placeholder: '1.2 或 20%',
  },
  {
    key: 'mainAttackBuff',
    label: '主线攻击BUFF',
    defaultValue: '1',
    kind: 'bonusMultiplier',
    optional: true,
    placeholder: '1.2 或 20%',
  },
  {
    key: 'enemyDefense',
    label: '敌人防御',
    defaultValue: '0',
    kind: 'number',
  },
  {
    key: 'enemyResistance',
    label: '敌人属性抵抗',
    defaultValue: '0',
    kind: 'number',
    optional: true,
  },
  {
    key: 'enemyAllResistance',
    label: '敌人所有属性抵抗',
    defaultValue: '0',
    kind: 'number',
    optional: true,
  },
]

export const abyssFields: FieldConfig[] = [
  {
    key: 'attack',
    label: '攻击力',
    defaultValue: '0',
    kind: 'number',
    placeholder: '100M',
  },
  {
    key: 'penetration',
    label: '穿透',
    defaultValue: '0',
    kind: 'number',
    placeholder: '100M',
  },
  {
    key: 'critDamage',
    label: '暴伤',
    defaultValue: '1',
    kind: 'multiplier',
    placeholder: '2 或 200%',
  },
  {
    key: 'skillRate',
    label: '技能倍率',
    defaultValue: '1',
    kind: 'multiplier',
    placeholder: '3.5 或 350%',
  },
  {
    key: 'ignoreDefense',
    label: '无视防御系数',
    defaultValue: '0',
    kind: 'ratio',
    optional: true,
    placeholder: '0.2 或 20%',
  },
  {
    key: 'reduceDefense',
    label: '降低防御系数',
    defaultValue: '0',
    kind: 'ratio',
    optional: true,
    placeholder: '0.2 或 20%',
  },
  {
    key: 'reduceResistance',
    label: '属性抵抗降低值',
    defaultValue: '0',
    kind: 'number',
    optional: true,
  },
  {
    key: 'petLevel',
    label: '宠物等级',
    defaultValue: '0',
    kind: 'level',
    optional: true,
  },
  {
    key: 'petBonusDirect',
    label: '宠物加成',
    defaultValue: '1',
    kind: 'bonusMultiplier',
    optional: true,
    placeholder: '1.5 或 50%',
  },
  {
    key: 'enemyDefense',
    label: '敌人防御',
    defaultValue: '0',
    kind: 'number',
  },
  {
    key: 'enemyResistance',
    label: '敌人属性抵抗',
    defaultValue: '0',
    kind: 'number',
    optional: true,
  },
]

export const runeQualities: RuneQuality[] = [
  { key: 'white', label: '白色品质' },
  { key: 'green', label: '绿色品质' },
  { key: 'blue', label: '蓝色品质' },
  { key: 'purple', label: '紫色品质' },
  { key: 'yellow', label: '黄色品质' },
  { key: 'red', label: '红色品质' },
]

export const runeGroups: RuneGroup[] = [
  {
    key: 'attack',
    label: '攻击符文',
    directKey: 'rune_attack_direct',
    directPlaceholder: '50% 或 0.5',
  },
  {
    key: 'penetration',
    label: '穿透符文',
    directKey: 'rune_penetration_direct',
    directPlaceholder: '50% 或 0.5',
  },
  {
    key: 'critDamage',
    label: '暴伤符文',
    directKey: 'rune_critDamage_direct',
    directPlaceholder: '8% 或 0.08',
  },
  {
    key: 'blood',
    label: '蚀血符文',
    directKey: 'rune_blood_direct',
    directPlaceholder: '100',
  },
  {
    key: 'armor',
    label: '蚀甲符文',
    directKey: 'rune_armor_direct',
    directPlaceholder: '100',
  },
]

export const percentRuneValues: Record<RuneQualityKey, number> = {
  white: 0.1,
  green: 0.5,
  blue: 1,
  purple: 5,
  yellow: 15,
  red: 1500,
}

export const critRuneValues: Record<RuneQualityKey, number> = {
  white: 0.01,
  green: 0.08,
  blue: 0.16,
  purple: 0.24,
  yellow: 0.32,
  red: 0.4,
}

export const corrosionRuneValues: Record<RuneQualityKey, number> = {
  white: 1,
  green: 2,
  blue: 3,
  purple: 5,
  yellow: 8,
  red: 100,
}
