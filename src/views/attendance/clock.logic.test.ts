/// <reference types="node" />

import assert from 'node:assert/strict'
import test from 'node:test'
import {
  calculateDistanceMeters,
  formatClockTime,
  hasAttendanceDateChanged,
  isInsideGeofence,
  resolveClockAction,
} from './clock.logic.ts'

const center = { longitude: 119.411209, latitude: 26.022543 }

test('13:30 前未打卡时执行上午打卡', () => {
  assert.equal(resolveClockAction(null, '13:29', '13:30'), 'MORNING_CLOCK')
  assert.equal(
    resolveClockAction(
      { clockInTime: null, clockOutTime: null },
      '09:00',
      '13:30',
    ),
    'MORNING_CLOCK',
  )
})

test('上午打卡完成后等待下午场次开放', () => {
  assert.equal(
    resolveClockAction(
      {
        clockInTime: '2026-07-23T09:00:00',
        clockOutTime: null,
      },
      '13:29',
      '13:30',
    ),
    'WAITING_AFTERNOON',
  )
})

test('13:30 起切换下午场次且不依赖上午记录', () => {
  assert.equal(resolveClockAction(null, '13:30', '13:30'), 'AFTERNOON_CLOCK')
  assert.equal(
    resolveClockAction(
      {
        clockInTime: '2026-07-23T09:00:00',
        clockOutTime: null,
      },
      '15:03',
      '13:30',
    ),
    'AFTERNOON_CLOCK',
  )
})

test('下午打卡完成后结束当天打卡', () => {
  assert.equal(
    resolveClockAction(
      {
        clockInTime: null,
        clockOutTime: '2026-07-23T14:00:00',
      },
      '14:00',
      '13:30',
    ),
    'COMPLETED',
  )
  assert.equal(
    resolveClockAction(
      {
        clockInTime: '2026-07-23T09:00:00',
        clockOutTime: '2026-07-23T14:00:00',
      },
      '14:00',
      '13:30',
    ),
    'COMPLETED',
  )
})

test('跨零点时识别为新的考勤日期', () => {
  assert.equal(
    hasAttendanceDateChanged('2026-07-23', '2026-07-24'),
    true,
  )
  assert.equal(
    hasAttendanceDateChanged('2026-07-24', '2026-07-24'),
    false,
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
