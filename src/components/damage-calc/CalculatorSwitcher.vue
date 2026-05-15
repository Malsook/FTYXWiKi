<template>
  <a-card class="calc-switch-card" size="small">
    <div class="calc-switch-row">
      <span class="switch-label">切换计算器</span>

      <a-radio-group
        :value="activeIndex"
        button-style="solid"
        size="small"
        @change="handleIndexChange"
      >
        <a-radio-button v-for="index in 10" :key="index - 1" :value="index - 1">
          {{ index }}
        </a-radio-button>
      </a-radio-group>
    </div>

    <div class="calc-switch-row">
      <span class="switch-label">计算器类型</span>

      <a-radio-group
        :value="calculatorType"
        button-style="solid"
        size="small"
        @change="handleTypeChange"
      >
        <a-radio-button value="base">基础计算器</a-radio-button>
        <a-radio-button value="abyss">深渊计算器</a-radio-button>
      </a-radio-group>
    </div>
  </a-card>
</template>

<script setup lang="ts">
import type { RadioChangeEvent } from 'ant-design-vue'
import type { CalculatorType } from '@/types/damage'

defineProps<{
  activeIndex: number
  calculatorType: CalculatorType
}>()

const emit = defineEmits<{
  'update:activeIndex': [value: number]
  'update:calculatorType': [value: CalculatorType]
}>()

function handleIndexChange(event: RadioChangeEvent) {
  emit('update:activeIndex', Number(event.target.value))
}

function handleTypeChange(event: RadioChangeEvent) {
  emit('update:calculatorType', event.target.value as CalculatorType)
}
</script>

<style scoped>
.calc-switch-card {
  border-radius: 12px;
}

.calc-switch-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.calc-switch-row + .calc-switch-row {
  margin-top: 10px;
}

.switch-label {
  min-width: 80px;
  color: #666;
  font-size: 13px;
  font-weight: 600;
}

@media (max-width: 768px) {
  .switch-label {
    min-width: auto;
  }

  .calc-switch-row {
    align-items: flex-start;
    flex-direction: column;
    gap: 6px;
  }
}
</style>
