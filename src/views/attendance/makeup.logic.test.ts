/// <reference types="node" />

import assert from 'node:assert/strict'
import test from 'node:test'
import {
  buildMakeupApplicationRequest,
  resolveMakeupActionState,
} from './makeup.logic.ts'

test('有权限且有剩余额度的迟到记录可以申请补签', () => {
  assert.equal(
    resolveMakeupActionState({
      attendanceStatus: 'LATE',
      canSubmit: true,
      hasActiveApplication: false,
      remainingCount: 2,
    }),
    'AVAILABLE',
  )
})

test('已有有效申请或没有额度时不能重复提交补签', () => {
  assert.equal(
    resolveMakeupActionState({
      attendanceStatus: 'LATE',
      canSubmit: true,
      hasActiveApplication: true,
      remainingCount: 2,
    }),
    'PENDING',
  )
  assert.equal(
    resolveMakeupActionState({
      attendanceStatus: 'LATE',
      canSubmit: true,
      hasActiveApplication: false,
      remainingCount: 0,
    }),
    'UNAVAILABLE',
  )
})

test('补签请求保留记录编号并清理原因首尾空白', () => {
  assert.deepEqual(buildMakeupApplicationRequest(18, '  早高峰交通拥堵  '), {
    attendanceRecordId: 18,
    reason: '早高峰交通拥堵',
  })
})
