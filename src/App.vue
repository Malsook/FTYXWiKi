<template>
  <a-layout class="app-layout">
    <a-layout-sider
      v-model:collapsed="collapsed"
      collapsible
      :trigger="null"
      :width="240"
      :collapsed-width="isMobile ? 0 : 72"
      breakpoint="md"
      class="app-sider"
      @breakpoint="handleBreakpoint"
    >
      <div class="brand">
        <div v-if="collapsed" class="brand-logo">飞</div>

        <div v-else class="brand-title">飞艇英雄WiKi</div>
      </div>

      <a-menu
        v-model:selectedKeys="selectedKeys"
        v-model:openKeys="openKeys"
        mode="inline"
        theme="dark"
        class="side-menu"
        @click="handleMenuClick"
      >
        <a-menu-item key="/">
          <template #icon>
            <HomeOutlined />
          </template>
          首页
        </a-menu-item>

        <a-sub-menu key="data-query">
          <template #icon>
            <DatabaseOutlined />
          </template>
          <template #title> 资料查询 </template>

          <a-menu-item key="/data/knights"> 骑士资料 </a-menu-item>

          <a-menu-item key="/data/fates"> 缘分资料 </a-menu-item>

          <a-menu-item key="/data/damage-detail"> 伤害详解 </a-menu-item>
        </a-sub-menu>

        <a-menu-item key="/damage-calc">
          <template #icon>
            <CalculatorOutlined />
          </template>
          伤害计算
        </a-menu-item>

        <a-menu-item key="/gem-plan">
          <template #icon>
            <BgColorsOutlined />
          </template>
          玉石方案
        </a-menu-item>

        <a-menu-item key="/fate-calc">
          <template #icon>
            <BranchesOutlined />
          </template>
          缘分计算
        </a-menu-item>
      </a-menu>
    </a-layout-sider>

    <a-layout>
      <a-layout-header class="app-header">
        <div class="header-left">
          <MenuUnfoldOutlined
            v-if="collapsed"
            class="collapse-trigger"
            @click="collapsed = false"
          />

          <MenuFoldOutlined v-else class="collapse-trigger" @click="collapsed = true" />

          <span class="page-title">
            {{ pageTitle }}
          </span>
        </div>
      </a-layout-header>

      <a-layout-content class="app-content">
        <div class="content-card">
          <router-view />
        </div>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  HomeOutlined,
  DatabaseOutlined,
  CalculatorOutlined,
  BgColorsOutlined,
  BranchesOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons-vue'

type MenuClickInfo = {
  key: string | number
}

const route = useRoute()
const router = useRouter()

const collapsed = ref(false)
const isMobile = ref(false)

const selectedKeys = ref<string[]>([])
const openKeys = ref<string[]>([])

const pageTitle = computed(() => {
  return String(route.meta.title || '飞艇英雄WiKi')
})

const syncMenuWithRoute = () => {
  selectedKeys.value = [route.path]

  if (route.path.startsWith('/data')) {
    openKeys.value = ['data-query']
  } else {
    openKeys.value = []
  }
}

watch(
  () => route.path,
  () => {
    syncMenuWithRoute()
  },
  {
    immediate: true,
  },
)

const handleBreakpoint = (broken: boolean) => {
  isMobile.value = broken

  if (broken) {
    collapsed.value = true
  } else {
    collapsed.value = false
  }
}

const handleMenuClick = async (info: MenuClickInfo) => {
  const path = String(info.key)

  if (path !== route.path) {
    await router.push(path)
  }

  // 手机端点击菜单后，左侧菜单自动隐藏
  if (isMobile.value) {
    collapsed.value = true
  }
}
</script>

<style scoped>
:global(body) {
  margin: 0;
}

:global(#app) {
  min-height: 100vh;
}

.app-layout {
  min-height: 100vh;
}

.app-sider {
  min-height: 100vh;
}

.brand {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  color: #fff;
  overflow: hidden;
}

.brand-title {
  width: 100%;
  height: 40px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
  white-space: nowrap;
  letter-spacing: 0.5px;
}

.brand-logo {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: #1677ff;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 800;
}

.side-menu {
  border-right: 0;
}

.app-header {
  height: 45px;
  padding: 0 24px;
  background: #fff;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.collapse-trigger {
  font-size: 20px;
  cursor: pointer;
  color: #333;
}

.collapse-trigger:hover {
  color: #1677ff;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
}

.app-content {
  padding: 10px;
  background: #f5f5f5;
}

.content-card {
  min-height: calc(100vh - 112px);
  padding: 24px;
  background: #fff;
  border-radius: 12px;
}

/* 手机端 */
@media (max-width: 768px) {
  .app-header {
    padding: 0 16px;
  }

  .app-content {
    padding: 10px;
  }

  .content-card {
    min-height: calc(100vh - 96px);
    padding: 16px;
  }

  .brand {
    padding: 0 8px;
  }
}
</style>
