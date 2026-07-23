/// <reference types="node" />

import assert from 'node:assert/strict'
import test from 'node:test'
import {
  buildOfficeQuestionRequest,
  getAiStatusMeta,
  validateOfficeQuestion,
} from './intelligence.logic.ts'

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
