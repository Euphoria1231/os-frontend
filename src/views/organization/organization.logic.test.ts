/// <reference types="node" />

import assert from 'node:assert/strict'
import test from 'node:test'
import {
  getDepartmentChangeFields,
  getDepartmentEmployeeOptions,
  getDepartmentPositionOptions,
} from './organization.logic.ts'

test('岗位候选只包含所选部门的启用岗位', () => {
  const positions = [
    { id: 11, departmentId: 1, code: 'JAVA_DEV', name: 'Java 开发', status: 1 as const },
    { id: 12, departmentId: 1, code: 'JAVA_ARCH', name: 'Java 架构师', status: 0 as const },
    { id: 21, departmentId: 2, code: 'HR_STAFF', name: '人事专员', status: 1 as const },
  ]

  assert.deepEqual(getDepartmentPositionOptions(positions, 1), [
    { label: 'Java 开发 · JAVA_DEV', value: 11 },
  ])
  assert.deepEqual(getDepartmentPositionOptions(positions, undefined), [])
})

test('员工候选只包含同部门在职员工并排除当前员工', () => {
  const employees = [
    { id: 101, departmentId: 1, employeeNo: 'E101', realName: '张员工', status: 1 as const },
    { id: 102, departmentId: 1, employeeNo: 'E102', realName: '李主管', status: 1 as const },
    { id: 103, departmentId: 1, employeeNo: 'E103', realName: '停用员工', status: 0 as const },
    { id: 201, departmentId: 2, employeeNo: 'E201', realName: '其他部门员工', status: 1 as const },
  ]

  assert.deepEqual(getDepartmentEmployeeOptions(employees, 1, 101), [
    { label: '李主管 · E102', value: 102 },
  ])
  assert.deepEqual(getDepartmentEmployeeOptions(employees, undefined), [])
})

test('切换部门时清空原岗位和直属领导', () => {
  assert.deepEqual(getDepartmentChangeFields(2), {
    departmentId: 2,
    positionId: undefined,
    leaderId: null,
  })
})
