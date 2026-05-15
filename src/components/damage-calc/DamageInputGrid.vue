<template>
  <a-card title="输入参数" class="input-card compact-card" size="small">
    <a-row :gutter="[8, 8]">
      <a-col v-for="field in fields" :key="field.key" :span="8">
        <div class="field-item">
          <div class="field-head">
            <span class="field-label" :title="field.label">
              {{ field.label }}
            </span>

            <a-switch
              v-if="field.optional"
              :checked="Boolean(calculator.enabled[field.key])"
              size="small"
              @update:checked="handleEnabledChange(field.key, $event)"
            />
          </div>

          <a-input
            :value="calculator.values[field.key]"
            :placeholder="field.placeholder"
            :disabled="field.optional && !calculator.enabled[field.key]"
            class="compact-input"
            size="small"
            allow-clear
            @update:value="handleValueChange(field.key, $event)"
          />
        </div>
      </a-col>
    </a-row>
  </a-card>
</template>

<script setup lang="ts">
import type { CalculatorState, FieldConfig } from '@/types/damage'

defineProps<{
  fields: FieldConfig[]
  calculator: CalculatorState
}>()

const emit = defineEmits<{
  updateValue: [key: string, value: string]
  updateEnabled: [key: string, enabled: boolean]
}>()

function handleValueChange(key: string, value: string) {
  emit('updateValue', key, value ?? '')
}

function handleEnabledChange(key: string, enabled: boolean) {
  emit('updateEnabled', key, enabled)
}
</script>

<style scoped>
.input-card {
  border-radius: 12px;
}

.compact-card :deep(.ant-card-body) {
  padding: 10px;
}

.field-item {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.field-head {
  min-height: 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  font-size: 12px;
  line-height: 18px;
  font-weight: 600;
}

.field-label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}


.compact-input :deep(input) {
  min-width: 0;
  overflow-x: auto;
  white-space: nowrap;
  text-overflow: clip;
  font-size: 12px;
}

@media (max-width: 768px) {
  .compact-card :deep(.ant-card-body) {
    padding: 8px;
  }

  .field-head {
    font-size: 11px;
  }

  .compact-input :deep(input) {
    font-size: 11px;
  }
}
</style>
