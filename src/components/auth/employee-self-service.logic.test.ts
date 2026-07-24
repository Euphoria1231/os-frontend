/// <reference types="node" />

import assert from 'node:assert/strict'
import test from 'node:test'
import { canAccessEmployeeSelfServicePath } from './employee-self-service.logic.ts'

test('超级管理员不能访问考勤和我的申请路径', () => {
  assert.equal(canAccessEmployeeSelfServicePath('/attendance', true), false)
  assert.equal(canAccessEmployeeSelfServicePath('/attendance/', true), false)
  assert.equal(canAccessEmployeeSelfServicePath('/flow/applications', true), false)
})

test('超级管理员仍可访问审批中心和其他后台页面', () => {
  assert.equal(canAccessEmployeeSelfServicePath('/flow/approvals', true), true)
  assert.equal(canAccessEmployeeSelfServicePath('/employees', true), true)
})

test('普通员工可以访问员工自助路径', () => {
  assert.equal(canAccessEmployeeSelfServicePath('/attendance', false), true)
  assert.equal(canAccessEmployeeSelfServicePath('/flow/applications', false), true)
})
