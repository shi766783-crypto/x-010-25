<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTravelStore } from '../stores/travel'
import { formatDate, formatMoney } from '../utils/format'
import BarChart from '../components/charts/BarChart.vue'
import DonutChart from '../components/charts/DonutChart.vue'

const store = useTravelStore()
const router = useRouter()

const stats = computed(() => store.dashboardStats)
const money = (v) => formatMoney(v)
// 已结束但未写总结的计划，写完保存后此列表自动为空、提示消失
const pendingSummaryPlans = computed(() => store.plansNeedingSummary)

function goToSummary(plan) {
  router.push({ path: `/plans/${plan.id}`, query: { tab: 'summary' } })
}

const statCards = computed(() => [
  { label: '累计出行次数', value: stats.value.totalTrips, suffix: '次' },
  { label: '总花费', value: money(stats.value.totalSpend), suffix: '' },
  { label: '最常去目的地', value: stats.value.mostVisited, suffix: '' },
  { label: '平均每次出行天数', value: stats.value.avgDays, suffix: '天' },
  { label: '行李打包完成率', value: stats.value.avgPackingRate, suffix: '%' },
])
</script>

<template>
  <div>
    <!-- 已结束未写总结提醒 -->
    <div v-if="pendingSummaryPlans.length" class="summary-reminder">
      <div class="reminder-head">
        <span class="reminder-title">
          <span class="reminder-icon">!</span>
          {{ pendingSummaryPlans.length }} 个出行计划已结束，别忘了补写总结
        </span>
        <span class="reminder-hint">评分或文字填写任意一项即可</span>
      </div>
      <div class="reminder-list">
        <button
          v-for="plan in pendingSummaryPlans"
          :key="plan.id"
          type="button"
          class="reminder-item"
          @click="goToSummary(plan)"
        >
          <span class="reminder-name">{{ plan.name }}</span>
          <span class="reminder-date text-muted">结束于 {{ formatDate(plan.endDate) }}</span>
          <span class="reminder-action">去补写 ›</span>
        </button>
      </div>
    </div>

    <div v-if="store.plans.length" class="stat-grid" :class="{ 'mt-16': pendingSummaryPlans.length }">
      <div v-for="(card, i) in statCards" :key="i" class="stat-card">
        <span class="stat-label">{{ card.label }}</span>
        <strong class="stat-value">{{ card.value }}<small v-if="card.suffix">{{ card.suffix }}</small></strong>
      </div>
    </div>

    <div v-else class="card empty">
      <p class="empty-icon">+</p>
      <p>还没有出行计划，先创建你的第一个出行计划吧</p>
      <button class="btn btn-primary mt-16" @click="router.push('/plans/new')">新建出行计划</button>
    </div>

    <template v-if="store.plans.length">
      <div class="grid-2 mt-16">
        <div class="card">
          <h3 class="card-title">出行类型分布</h3>
          <BarChart :data="stats.tripTypeDist" />
        </div>
        <div class="card">
          <h3 class="card-title">花费分类汇总</h3>
          <DonutChart :data="stats.categorySpend" :formatter="money" />
        </div>
      </div>

      <div class="card mt-16">
        <h3 class="card-title">各次出行花费对比</h3>
        <BarChart :data="stats.perTripSpend" :formatter="money" color="#10b981" />
      </div>
    </template>
  </div>
</template>

<style scoped>
.summary-reminder {
  background: var(--warning-light);
  border: 1px solid #fcd34d;
  border-radius: var(--radius);
  padding: 14px 16px;
}

.reminder-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.reminder-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #92400e;
}

.reminder-icon {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--warning);
  color: #fff;
  display: inline-grid;
  place-items: center;
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
}

.reminder-hint {
  font-size: 12px;
  color: #b45309;
}

.reminder-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 10px;
}

.reminder-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #fde68a;
  border-radius: var(--radius-sm);
  background: var(--surface);
  font-size: 13px;
  text-align: left;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.reminder-item:hover {
  border-color: var(--warning);
  box-shadow: var(--shadow);
}

.reminder-name {
  font-weight: 600;
}

.reminder-date {
  font-size: 12px;
}

.reminder-action {
  margin-left: auto;
  color: var(--warning);
  font-weight: 500;
  flex-shrink: 0;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}

.stat-card {
  background: var(--surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 18px;
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 13px;
  color: var(--text-secondary);
}

.stat-value {
  font-size: 26px;
  font-weight: 700;
  margin-top: 6px;
}

.stat-value small {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-left: 2px;
}
</style>
