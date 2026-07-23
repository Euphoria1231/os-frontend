/// <reference types="node" />

import assert from 'node:assert/strict'
import test from 'node:test'
import type { FlowApplication } from '../flow/flow.types.ts'
import {
  buildOfficeQuestionRequest,
  getAiStatusMeta,
  mergeApprovalCandidates,
  validateOfficeQuestion,
} from './intelligence.logic.ts'

function createApplication(
  id: number,
  createdAt: string,
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
    createdAt,
    updatedAt: createdAt,
    approvalProgress: [],
    ...overrides,
  }
}

test('办公问题必须包含 1 到 500 个有效字符', () => {
  assert.equal(validateOfficeQuestion('   '), '请输入需要咨询的办公问题')
  assert.equal(validateOfficeQuestion('考勤规则是什么？'), null)
  assert.equal(validateOfficeQuestion('问'.repeat(500)), null)
  assert.equal(validateOfficeQuestion('问'.repeat(501)), '问题不能超过 500 个字符')
})

test('办公问答请求会清理问题首尾空白', () => {
  assert.deepEqual(buildOfficeQuestionRequest('  请说明请假审批流程  '), {
    question: '请说明请假审批流程',
  })
})

test('AI 调用状态提供明确且不同的展示语义', () => {
  assert.deepEqual(getAiStatusMeta('SUCCESS'), {
    label: '分析完成',
    color: 'success',
    description: '模型已完成本次分析',
  })
  assert.deepEqual(getAiStatusMeta('DEGRADED'), {
    label: '降级结果',
    color: 'warning',
    description: '模型暂不可用，当前展示规则引擎生成的保底结果',
  })
  assert.deepEqual(getAiStatusMeta('FAILED'), {
    label: '分析失败',
    color: 'error',
    description: '本次分析未生成有效结果，请稍后重试',
  })
})

test('审批分析候选合并我的申请和待办并按时间倒序去重', () => {
  const duplicate = createApplication(2, '2026-07-22T12:00:00')
  const candidates = mergeApprovalCandidates(
    [
      createApplication(1, '2026-07-21T12:00:00'),
      duplicate,
      createApplication(4, '2026-07-24T12:00:00', { applicationType: 'MAKEUP' }),
    ],
    [duplicate, createApplication(3, '2026-07-23T12:00:00', { applicationType: 'OVERTIME' })],
  )

  assert.deepEqual(candidates.map((application) => application.id), [3, 2, 1])
})
