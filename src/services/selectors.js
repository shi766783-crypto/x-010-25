import { EXPENSE_CATEGORIES } from '../constants'
import { luggageCompletionRate } from './luggage'

function toNum(value) {
  return Number(value) || 0
}

// 单次出行总花费
export function planTotalSpend(plan) {
  return (plan.records || []).reduce(
    (sum, r) =>
      sum +
      toNum(r.transportCost) +
      toNum(r.mealCost) +
      toNum(r.ticketCost) +
      toNum(r.shoppingCost) +
      toNum(r.otherCost),
    0
  )
}

// 单次出行花费分类汇总
export function planSpendBreakdown(plan) {
  const records = plan.records || []
  return EXPENSE_CATEGORIES.reduce((acc, { key, label }) => {
    acc[label] = records.reduce((sum, r) => sum + toNum(r[key]), 0)
    return acc
  }, {})
}

// 单次出行行李打包完成率（各成员平均）
export function planPackingRate(plan) {
  const lists = plan.luggage || []
  if (!lists.length) return 0
  const sum = lists.reduce((s, l) => s + luggageCompletionRate(l.items), 0)
  return Math.round(sum / lists.length)
}

// 单次出行待办完成进度（0-100）
export function planTodoProgress(plan) {
  const todos = plan.todos || []
  if (!todos.length) return 0
  return Math.round((todos.filter((t) => t.done).length / todos.length) * 100)
}

// 判断待办是否全部完成
export function planTodosAllDone(plan) {
  const todos = plan.todos || []
  return todos.length > 0 && todos.every((t) => t.done)
}

// 判断计划是否已结束（结束日期早于今天）
export function isPlanEnded(plan) {
  if (!plan.endDate) return false
  const now = new Date()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  return plan.endDate < `${now.getFullYear()}-${mm}-${dd}`
}

// 判断出行总结是否已写（只填评分或只填文字都算已写）
export function hasSummary(plan) {
  const s = plan.summary
  if (!s) return false
  const hasText = [s.highlights, s.regrets, s.suggestions].some((t) => t && t.trim())
  return Boolean(s.rating) || hasText
}

// 判断计划是否需要补写总结（已结束且总结未写）
export function needsSummary(plan) {
  return isPlanEnded(plan) && !hasSummary(plan)
}

// 筛选出已结束但未写总结的计划
export function plansPendingSummary(plans) {
  return (plans || []).filter((p) => needsSummary(p))
}
