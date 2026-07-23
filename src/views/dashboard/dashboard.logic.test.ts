/// <reference types="node" />

import assert from 'node:assert/strict'
import test from 'node:test'
import { dashboardMockData } from './dashboard.data.ts'
import {
  assertDashboardDataConsistency,
  createDashboardEvent,
  createSeededRandom,
  getDashboardDataTotals,
  getDashboardReturnPath,
  getMetricCountUpValue,
  getNextEventDelay,
} from './dashboard.logic.ts'

test('固定组织数据在所有维度保持 1690 人', () => {
  assert.deepEqual(getDashboardDataTotals(), {
    departments: 1690,
    positions: 1690,
    cities: 1690,
  })
  assert.doesNotThrow(assertDashboardDataConsistency)
})

test('动态事件只使用区域城市和五类协同事件', () => {
  const random = createSeededRandom(20260723)
  const event = createDashboardEvent(8426, random, new Date('2026-07-23T14:32:08'))

  assert.ok(
    dashboardMockData.cities.some(
      (city) => city.id === event.cityId && city.kind === 'REGIONAL',
    ),
  )
  assert.ok(dashboardMockData.eventTypes.includes(event.type))
  assert.ok(event.amount >= 12 && event.amount <= 36)
  assert.equal(event.total, 8426 + event.amount)
})

test('动态事件间隔限制为 3 到 5 秒', () => {
  assert.equal(getNextEventDelay(() => 0), 3000)
  assert.equal(getNextEventDelay(() => 0.9999), 5000)
})

test('返回按钮根据认证状态选择工作台或登录页', () => {
  assert.equal(getDashboardReturnPath(true), '/workspace')
  assert.equal(getDashboardReturnPath(false), '/login')
})

test('核心指标首屏递增值限制在零和目标值之间', () => {
  assert.equal(getMetricCountUpValue(1690, 0), 0)
  assert.equal(getMetricCountUpValue(1690, 0.5), 1479)
  assert.equal(getMetricCountUpValue(1690, 1), 1690)
  assert.equal(getMetricCountUpValue(28, 2), 28)
})
