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

// 本地日期字符串 YYYY-MM-DD（避免时区导致结束日判断偏移）
export function localDateString(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// 计划是否已结束（结束日期早于今天，结束当天仍算进行中）
export function planIsEnded(plan, today = localDateString()) {
  return Boolean(plan.endDate) && plan.endDate < today
}

// 总结是否算已写：填写了评分或任意一段文字均算
// （只传了照片但评分与文字都为空，不算已写）
export function planHasSummary(plan) {
  const s = plan.summary
  if (!s) return false
  if (Number(s.rating) > 0) return true
  return ['highlights', 'regrets', 'suggestions'].some(
    (key) => typeof s[key] === 'string' && s[key].trim()
  )
}

// 已结束但还没有写总结，需要提醒补写
export function planNeedsSummary(plan, today = localDateString()) {
  return planIsEnded(plan, today) && !planHasSummary(plan)
}
