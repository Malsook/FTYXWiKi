<template>
  <div class="damage-calc-page">
    <DamageCalcToolbar
      :output-mode="state.outputMode"
      @update:output-mode="state.outputMode = $event"
      @copy="copyCurrentCalculator"
      @paste="pasteToCurrentCalculator"
      @reset-current="resetCurrentCalculator"
      @reset-all="resetAllCalculators"
    />

    <CalculatorSwitcher
      :active-index="state.activeIndex"
      :calculator-type="activeCalculator.type"
      @update:active-index="setActiveIndex"
      @update:calculator-type="setCalculatorType"
    />

    <a-alert
      v-if="!currentResult.valid"
      class="error-alert"
      message="非法输入"
      description="请检查输入内容是否为空、算式是否正确、比例是否超出范围，或符文个数是否为非负整数。"
      type="error"
      show-icon
    />

    <DamageInputGrid
      :fields="currentFields"
      :calculator="activeCalculator"
      @update-value="setFieldValue"
      @update-enabled="setFieldEnabled"
    />

    <AbyssRuneInput
      v-if="activeCalculator.type === 'abyss'"
      :calculator="activeCalculator"
      @update-value="setFieldValue"
    />

    <DamageResultPanel
      :result="currentResult"
      :calculator-type="activeCalculator.type"
      :output-mode="state.outputMode"
    />
  </div>
</template>

<script setup lang="ts">
import DamageCalcToolbar from '@/components/damage-calc/DamageCalcToolbar.vue'
import CalculatorSwitcher from '@/components/damage-calc/CalculatorSwitcher.vue'
import DamageInputGrid from '@/components/damage-calc/DamageInputGrid.vue'
import AbyssRuneInput from '@/components/damage-calc/AbyssRuneInput.vue'
import DamageResultPanel from '@/components/damage-calc/DamageResultPanel.vue'
import { useDamageCalculator } from '@/composables/useDamageCalculator'

const {
  state,
  activeCalculator,
  currentFields,
  currentResult,
  setActiveIndex,
  setCalculatorType,
  resetCurrentCalculator,
  resetAllCalculators,
  copyCurrentCalculator,
  pasteToCurrentCalculator,
  setFieldValue,
  setFieldEnabled,
} = useDamageCalculator()
</script>

<style scoped>
.damage-calc-page {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.error-alert {
  border-radius: 10px;
}
</style>
