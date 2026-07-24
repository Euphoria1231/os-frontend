/// <reference types="node" />

import assert from 'node:assert/strict'
import test from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import {
  CalendarTaskIndicator,
  shouldShowWorkspaceUtilityRail,
} from './WorkspaceUtilityRail.logic.ts'

test('工作台和智能办公页使用完整内容宽度', () => {
  assert.equal(shouldShowWorkspaceUtilityRail('/workspace'), false)
  assert.equal(shouldShowWorkspaceUtilityRail('/ai/assistant'), false)
})

test('其他业务页面继续显示工作区辅助栏', () => {
  assert.equal(shouldShowWorkspaceUtilityRail('/attendance'), true)
  assert.equal(shouldShowWorkspaceUtilityRail('/flow/applications'), true)
})

test('日历单元格只追加待办圆点而不重复日期数字', () => {
  const markup = renderToStaticMarkup(
    createElement(CalendarTaskIndicator, { hasTask: true }),
  )

  assert.equal(markup, '<i class="workspace-calendar-task-dot"></i>')
  assert.doesNotMatch(markup, /\d/)
})

test('没有待办的日期不追加额外内容', () => {
  const markup = renderToStaticMarkup(
    createElement(CalendarTaskIndicator, { hasTask: false }),
  )

  assert.equal(markup, '')
})
