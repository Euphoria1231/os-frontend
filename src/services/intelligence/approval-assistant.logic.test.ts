/// <reference types="node" />

import assert from 'node:assert/strict'
import test from 'node:test'
import type { FlowApplication } from '../flow/flow.types.ts'
import { getLeaveApprovalCandidates } from './approval-assistant.logic.ts'

function createApplication(
  id: number,
  createdAt: string,
  applicationType: FlowApplication['applicationType'],
): FlowApplication {
  return {
    id,
    applicationNo: `OA-${id}`,
    applicantId: 10,
    approverId: 20,
    applicationType,
    attendanceRecordId: null,
    startTime: '2026-07-24T09:00:00',
    endTime: '2026-07-24T18:00:00',
    reason: '个人事务',
    status: 'PENDING',
    createdAt,
    updatedAt: createdAt,
    approvalProgress: [],
  }
}

test('审批辅助候选只保留请假单并按提交时间倒序去重', () => {
  const leaveApplication = createApplication(2, '2026-07-23T12:00:00', 'LEAVE')
  const candidates = getLeaveApprovalCandidates([
    createApplication(3, '2026-07-24T12:00:00', 'OVERTIME'),
    leaveApplication,
    createApplication(1, '2026-07-24T11:00:00', 'LEAVE'),
    leaveApplication,
    createApplication(4, '2026-07-24T13:00:00', 'MAKEUP'),
  ])

  assert.deepEqual(candidates.map((application) => application.id), [1, 2])
})
