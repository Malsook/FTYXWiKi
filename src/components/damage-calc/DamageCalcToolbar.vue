<template>
  <div class="page-toolbar">
    <div class="title-wrap">
      <h1>伤害计算</h1>

      <a-popover trigger="hover" placement="bottomLeft">
        <template #content>
          <div class="help-content">
            <p>
              输入支持数值、算式和单位，例如：
              <code>100K</code>、<code>1a</code>、<code>(1+2)-3*4/5^6</code>。
            </p>
            <p>百分比输入例如 <code>200%</code> 或者 <code>2</code></p>
            <p>部分输入参数可选择不参与计算</p>
            <p>宠物加成开启后，会优先使用直接输入的宠物加成，不再按宠物等级推算。</p>
          </div>
        </template>

        <QuestionCircleOutlined class="help-icon" />
      </a-popover>
    </div>

    <div class="toolbar-actions">
      <a-radio-group
        :value="outputMode"
        button-style="solid"
        size="small"
        @change="handleOutputModeChange"
      >
        <a-radio-button value="number">数值</a-radio-button>
        <a-radio-button value="unit">单位</a-radio-button>
      </a-radio-group>

      <a-button size="small" @click="$emit('copy')">
        <template #icon>
          <CopyOutlined />
        </template>
        复制
      </a-button>

      <a-button size="small" @click="$emit('paste')">
        <template #icon>
          <SnippetsOutlined />
        </template>
        粘贴
      </a-button>

      <a-popconfirm
        title="确认重置当前计算器的所有参数？"
        ok-text="确认"
        cancel-text="取消"
        @confirm="$emit('resetCurrent')"
      >
        <a-button size="small">
          <template #icon>
            <ReloadOutlined />
          </template>
          重置当前
        </a-button>
      </a-popconfirm>

      <a-popconfirm
        title="确认重置全部计算器？"
        ok-text="确认"
        cancel-text="取消"
        @confirm="$emit('resetAll')"
      >
        <a-button size="small" danger> 重置全部 </a-button>
      </a-popconfirm>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RadioChangeEvent } from 'ant-design-vue'
import {
  CopyOutlined,
  QuestionCircleOutlined,
  ReloadOutlined,
  SnippetsOutlined,
} from '@ant-design/icons-vue'
import type { OutputMode } from '@/types/damage'

defineProps<{
  outputMode: OutputMode
}>()

const emit = defineEmits<{
  'update:outputMode': [value: OutputMode]
  copy: []
  paste: []
  resetCurrent: []
  resetAll: []
}>()

function handleOutputModeChange(event: RadioChangeEvent) {
  emit('update:outputMode', event.target.value as OutputMode)
}
</script>

<style scoped>
.page-toolbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-wrap h1 {
  margin: 0;
  font-size: 26px;
  font-weight: 700;
}

.help-icon {
  font-size: 18px;
  color: #1677ff;
  cursor: pointer;
}

.help-content {
  max-width: 380px;
}

.help-content p {
  margin: 0 0 8px;
  line-height: 1.6;
}

.help-content code {
  padding: 2px 6px;
  border-radius: 4px;
  background: #f5f5f5;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .title-wrap h1 {
    font-size: 22px;
  }

  .toolbar-actions {
    justify-content: flex-start;
  }
}
</style>
