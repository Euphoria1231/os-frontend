/// <reference types="node" />

import assert from 'node:assert/strict'
import test from 'node:test'
import type { FlowApplication } from '../../services/flow/flow.types.ts'
import { buildWorkbenchTasks, getTasksForDate } from './WorkbenchPage.logic.ts'

function createApplication(
  id: number,
  overrides: Partial<FlowApplication> = {},
): FlowApplication {
  return {
    id,
    applicationNo: `OA-${id}`,
    applicantId: 10,
    approverId: 20,
    applicationType: 'LEAVE',
    attendanceRecordId: null,
    startTime: '2026-07-23T09:00:00',
    endTime: '2026-07-23T18:00:00',
    reason: '个人事务',
    status: 'PENDING',
    createdAt: '2026-07-22T10:00:00',
    updatedAt: '2026-07-22T10:00:00',
    approvalProgress: [],
    ...overrides,
  }
}

test('工作台待办合并待审批的请假加班申请和待处理审批任务', () => {
  const tasks = buildWorkbenchTasks(
    [
      createApplication(1),
      createApplication(2, { applicationType: 'OVERTIME', status: 'APPROVED' }),
      createApplication(3, { applicationType: 'MAKEUP' }),
    ],
    [createApplication(4, { applicationType: 'OVERTIME', applicantId: 30 })],
  )

  assert.deepEqual(
    tasks.map(({ key, category, title }) => ({ key, category, title })),
    [
      { key: 'mine-1', category: 'MY_APPLICATION', title: '请假申请' },
      { key: 'approval-4', category: 'APPROVAL', title: '加班审批' },
    ],
  )
})

test('日历按申请开始日期筛选关联待办', () => {
  const tasks = buildWorkbenchTasks(
    [createApplication(1)],
    [createApplication(4, { startTime: '2026-07-24T13:30:00' })],
  )

  assert.deepEqual(
    getTasksForDate(tasks, '2026-07-24').map((task) => task.key),
    ['approval-4'],
  )
  assert.deepEqual(getTasksForDate(tasks, '2026-07-25'), [])
})
