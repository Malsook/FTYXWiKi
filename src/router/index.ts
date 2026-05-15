import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '@/views/HomeView.vue'
import KnightDataView from '@/views/KnightDataView.vue'
import FateDataView from '@/views/FateDataView.vue'
import DamageDetailView from '@/views/DamageDetailView.vue'
import DamageCalcView from '@/views/DamageCalcView.vue'
import GemPlanView from '@/views/GemPlanView.vue'
import FateCalcView from '@/views/FateCalcView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: {
        title: '首页',
      },
    },
    {
      path: '/data/knights',
      name: 'knight-data',
      component: KnightDataView,
      meta: {
        title: '骑士资料',
      },
    },
    {
      path: '/data/fates',
      name: 'fate-data',
      component: FateDataView,
      meta: {
        title: '缘分资料',
      },
    },
    {
      path: '/data/damage-detail',
      name: 'damage-detail',
      component: DamageDetailView,
      meta: {
        title: '伤害详解',
      },
    },
    {
      path: '/damage-calc',
      name: 'damage-calc',
      component: DamageCalcView,
      meta: {
        title: '伤害计算',
      },
    },
    {
      path: '/gem-plan',
      name: 'gem-plan',
      component: GemPlanView,
      meta: {
        title: '玉石方案',
      },
    },
    {
      path: '/fate-calc',
      name: 'fate-calc',
      component: FateCalcView,
      meta: {
        title: '缘分计算',
      },
    },
  ],
})

export default router
