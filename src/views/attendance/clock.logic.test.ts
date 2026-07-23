/// <reference types="node" />

import assert from 'node:assert/strict'
import test from 'node:test'
import {
  calculateDistanceMeters,
  formatClockTime,
  isInsideGeofence,
  resolveClockAction,
} from './clock.logic.ts'

const center = { longitude: 119.411209, latitude: 26.022543 }

test('尚未打卡时执行上班打卡', () => {
  assert.equal(resolveClockAction(null), 'CLOCK_IN')
  assert.equal(
    resolveClockAction({ clockInTime: null, clockOutTime: null }),
    'CLOCK_IN',
  )
})

test('上班打卡后执行下班打卡且完整打卡后结束', () => {
  assert.equal(
    resolveClockAction({
      clockInTime: '2026-07-23T09:00:00',
      clockOutTime: null,
    }),
    'CLOCK_OUT',
  )
  assert.equal(
    resolveClockAction({
      clockInTime: '2026-07-23T09:00:00',
      clockOutTime: '2026-07-23T17:00:00',
    }),
    'COMPLETED',
  )
})

test('中心点距离为零且五百米边界按规则判断', () => {
  assert.equal(calculateDistanceMeters(center, center), 0)

  const insideDistance = calculateDistanceMeters(center, {
    longitude: 119.411209,
    latitude: 26.027038702498,
  })
  const outsideDistance = calculateDistanceMeters(center, {
    longitude: 119.411209,
    latitude: 26.027040501139,
  })

  assert.equal(isInsideGeofence(insideDistance, 500), true)
  assert.equal(isInsideGeofence(outsideDistance, 500), false)
})

test('空实际时间显示未打卡', () => {
  assert.equal(formatClockTime(null), '未打卡')
  assert.equal(formatClockTime('2026-07-23T09:08:06'), '09:08:06')
})
