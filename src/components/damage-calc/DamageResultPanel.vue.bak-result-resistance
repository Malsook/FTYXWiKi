<template>
  <a-card title="计算结果" class="result-card" size="small">
    <div class="damage-result-grid">
      <div class="result-item result-normal">
        <div class="result-label">非暴击普攻伤害</div>
        <div class="result-value">
          {{ formatDamage(result.normalAttackDamage) }}
        </div>
      </div>

      <div class="result-item result-crit">
        <div class="result-label">暴击普攻伤害</div>
        <div class="result-value">
          {{ formatDamage(result.critAttackDamage) }}
        </div>
      </div>

      <div class="result-item result-skill">
        <div class="result-label">非暴击技能伤害</div>
        <div class="result-value">
          {{ formatDamage(result.normalSkillDamage) }}
        </div>
      </div>

      <div class="result-item result-crit-skill">
        <div class="result-label">暴击技能伤害</div>
        <div class="result-value">
          {{ formatDamage(result.critSkillDamage) }}
        </div>
      </div>
    </div>

    <div class="supplement-output-row">
      <div class="supplement-item">
        <span>穿透防御修正系数</span>
        <strong>{{ formatSupplement(result.penetrationDefenseCoef) }}</strong>
      </div>

      <div class="supplement-item">
        <span>属性抵抗修正系数</span>
        <strong>{{ formatSupplement(result.resistanceCoef) }}</strong>
      </div>

      <div v-if="calculatorType === 'base'" class="supplement-item">
        <span>团结加成</span>
        <strong>{{ formatSupplement(result.unityBonus) }}</strong>
      </div>

      <div v-if="calculatorType === 'base'" class="supplement-item">
        <span>魔力加成</span>
        <strong>{{ formatSupplement(result.magicBonus) }}</strong>
      </div>

      <div class="supplement-item">
        <span>宠物加成</span>
        <strong>{{ formatSupplement(result.petBonus) }}</strong>
      </div>
    </div>
  </a-card>
</template>

<script setup lang="ts">
import type { CalculatorType, CalcResult, OutputMode } from '@/types/damage'
import { formatByOutputMode, formatPlainNumber } from '@/utils/numberFormat'

const props = defineProps<{
  result: CalcResult
  calculatorType: CalculatorType
  outputMode: OutputMode
}>()

function formatDamage(value: number): string {
  if (!props.result.valid) {
    return '-'
  }

  return formatByOutputMode(value, props.outputMode)
}

function formatSupplement(value: number): string {
  if (!props.result.valid) {
    return '-'
  }

  return formatPlainNumber(value)
}
</script>

<style scoped>
.result-card {
  border-radius: 12px;
}

.damage-result-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}

.result-item {
  min-width: 0;
  min-height: 76px;
  padding: 10px;
  border: 1px solid #f0f0f0;
  border-radius: 10px;
  background: #fafafa;
}

.result-label {
  margin-bottom: 6px;
  color: #666;
  font-size: 12px;
  line-height: 1.3;
}

.result-value {
  overflow-wrap: anywhere;
  word-break: break-word;
  font-size: 16px;
  font-weight: 800;
  line-height: 1.25;
}

.result-normal .result-value {
  color: #333;
}

.result-crit .result-value {
  color: #d4a106;
}

.result-skill .result-value {
  color: #fa8c16;
}

.result-crit-skill .result-value {
  color: #cf1322;
}

.supplement-output-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #f0f0f0;
}

.supplement-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 999px;
  background: #f5f5f5;
  color: #666;
  font-size: 12px;
}

.supplement-item strong {
  color: #333;
  font-weight: 600;
}

@media (max-width: 768px) {
  .damage-result-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .result-item {
    min-height: 72px;
    padding: 8px;
  }

  .result-value {
    font-size: 15px;
  }
}
</style>
