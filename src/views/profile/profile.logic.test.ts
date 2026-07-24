/// <reference types="node" />

import assert from 'node:assert/strict'
import test from 'node:test'
import type { Employee } from '../../services/employee/employee.types.ts'
import { buildProfileDetails } from './profile.logic.ts'

const employee: Employee = {
  id: 7,
  employeeNo: 'OA-0007',
  username: 'zhangsan',
  realName: '张三',
  departmentId: 2,
  departmentName: '研发部',
  positionId: 5,
  positionName: 'Java 工程师',
  leaderId: null,
  leaderName: null,
  phone: null,
  email: 'zhangsan@example.com',
  status: 1,
  createdAt: '2026-07-20T09:30:00',
  updatedAt: '2026-07-23T18:45:00',
}

test('个人中心将当前员工资料转换为只读展示字段并处理空值', () => {
  assert.deepEqual(buildProfileDetails(employee), [
    { key: 'username', label: '登录账号', value: 'zhangsan' },
    { key: 'department', label: '所属部门', value: '研发部' },
    { key: 'position', label: '当前岗位', value: 'Java 工程师' },
    { key: 'leader', label: '直属领导', value: '未设置' },
    { key: 'phone', label: '手机号码', value: '未填写' },
    { key: 'email', label: '邮箱地址', value: 'zhangsan@example.com' },
    { key: 'createdAt', label: '账号创建时间', value: '2026-07-20 09:30' },
    { key: 'updatedAt', label: '资料更新时间', value: '2026-07-23 18:45' },
  ])
})
