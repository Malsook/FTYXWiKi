<template>
  <a-card title="深渊符文" class="input-card compact-card" size="small">
    <a-alert
      class="rune-tip"
      type="info"
      show-icon
      message="符文可以直接填写数值，也可以填写各品质数量。直接数值不为空时，优先使用直接数值。"
    />

    <a-row :gutter="[8, 8]">
      <a-col
        v-for="rune in runeGroups"
        :key="rune.key"
        :xs="12"
        :sm="12"
        :md="12"
        :lg="12"
        :xl="12"
      >
        <a-card size="small" :title="rune.label" class="rune-card">
          <div class="rune-direct-row">
            <span class="rune-direct-label">数值</span>

            <a-input
              :value="calculator.values[rune.directKey]"
              :placeholder="rune.directPlaceholder"
              class="compact-input"
              size="small"
              allow-clear
              @update:value="handleValueChange(rune.directKey, $event)"
            />
          </div>

          <div class="rune-count-grid">
            <div
              v-for="quality in runeQualities"
              :key="quality.key"
              class="rune-count-item"
              :class="`rune-quality-${quality.key}`"
              :title="quality.label"
            >
              <a-input
                :value="calculator.values[getRuneCountKey(rune.key, quality.key)]"
                class="compact-input rune-count-input"
                placeholder="0"
                size="small"
                :maxlength="2"
                @update:value="handleValueChange(getRuneCountKey(rune.key, quality.key), $event)"
              />
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>
  </a-card>
</template>

<script setup lang="ts">
import { runeGroups, runeQualities } from '@/constants/damageCalculator'
import type { CalculatorState } from '@/types/damage'
import { getRuneCountKey } from '@/utils/damageFormula'

defineProps<{
  calculator: CalculatorState
}>()

const emit = defineEmits<{
  updateValue: [key: string, value: string]
}>()

function handleValueChange(key: string, value: string) {
  emit('updateValue', key, value ?? '')
}
</script>

<style scoped>
.input-card {
  border-radius: 12px;
}

.compact-card :deep(.ant-card-body) {
  padding: 10px;
}

.compact-input :deep(input) {
  min-width: 0;
  overflow-x: auto;
  white-space: nowrap;
  text-overflow: clip;
  font-size: 12px;
}

.rune-tip {
  margin-bottom: 8px;
  border-radius: 8px;
}

.rune-card {
  height: 100%;
  border-radius: 10px;
}

.rune-card :deep(.ant-card-head) {
  min-height: 32px;
  padding: 0 8px;
}

.rune-card :deep(.ant-card-head-title) {
  padding: 6px 0;
  font-size: 13px;
}

.rune-card :deep(.ant-card-body) {
  padding: 8px;
}

.rune-direct-row {
  display: grid;
  grid-template-columns: 32px 1fr;
  gap: 6px;
  align-items: center;
  margin-bottom: 8px;
}

.rune-direct-label {
  color: #666;
  font-size: 12px;
}

.rune-count-grid {
  display: grid;
  grid-template-columns: repeat(6, 28px);
  gap: 6px;
  align-items: center;
}

.rune-count-item {
  width: 28px;
  padding-top: 3px;
}

.rune-count-item::before {
  content: '';
  display: block;
  height: 4px;
  margin-bottom: 3px;
  border-radius: 999px;
}

.rune-count-input {
  width: 28px;
}

.rune-count-input :deep(input) {
  padding-inline: 2px;
  text-align: center;
  font-size: 11px;
}

.rune-quality-white::before {
  background: #d9d9d9;
}

.rune-quality-green::before {
  background: #52c41a;
}

.rune-quality-blue::before {
  background: #1677ff;
}

.rune-quality-purple::before {
  background: #722ed1;
}

.rune-quality-yellow::before {
  background: #fadb14;
}

.rune-quality-red::before {
  background: #ff4d4f;
}

@media (max-width: 768px) {
  .compact-card :deep(.ant-card-body) {
    padding: 8px;
  }

  .compact-input :deep(input) {
    font-size: 11px;
  }

  .rune-count-grid {
    grid-template-columns: repeat(3, 28px);
  }
}
</style>
