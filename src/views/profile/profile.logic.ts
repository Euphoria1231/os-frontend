import type { Employee } from '../../services/employee/employee.types.ts'
import { formatDateTime } from '../../utils/date.ts'

export interface ProfileDetail {
  key: string
  label: string
  value: string
}

export function buildProfileDetails(employee: Employee): ProfileDetail[] {
  return [
    { key: 'username', label: '登录账号', value: employee.username },
    { key: 'department', label: '所属部门', value: employee.departmentName ?? '未分配' },
    { key: 'position', label: '当前岗位', value: employee.positionName ?? '未分配' },
    { key: 'leader', label: '直属领导', value: employee.leaderName ?? '未设置' },
    { key: 'phone', label: '手机号码', value: employee.phone ?? '未填写' },
    { key: 'email', label: '邮箱地址', value: employee.email ?? '未填写' },
    { key: 'createdAt', label: '账号创建时间', value: formatDateTime(employee.createdAt) },
    { key: 'updatedAt', label: '资料更新时间', value: formatDateTime(employee.updatedAt) },
  ]
}
