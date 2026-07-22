import type { RecordStatus } from './organization'

export interface EmployeeQuery {
  keyword?: string
  departmentId?: string
  positionId?: string
  status?: RecordStatus
}

export interface Employee {
  id: string
  username: string
  realName: string
  employeeNo: string
  phone?: string
  email?: string
  departmentId?: string
  departmentName?: string
  positionId?: string
  positionName?: string
  status: RecordStatus
  roleIds?: string[]
  roleNames?: string[]
  createdAt?: string
  updatedAt?: string
}

export interface EmployeeRequest {
  username: string
  realName: string
  employeeNo: string
  phone?: string
  email?: string
  departmentId?: string
  positionId?: string
  status: RecordStatus
  password?: string
}

export interface RoleSummary {
  id: string
  name: string
  code: string
  status?: RecordStatus
}

export interface AssignEmployeeRolesRequest {
  roleIds: string[]
}

export interface EmployeePermissionSummary {
  employeeId: string
  permissionCodes: string[]
}
