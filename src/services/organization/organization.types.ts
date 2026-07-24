import type { EmployeeStatus } from '../employee/employee.types.ts'

export interface DepartmentRequest {
  parentId: number
  name: string
  leaderEmployeeId?: number | null
  sortOrder: number
  status: EmployeeStatus
}

export interface Department extends DepartmentRequest {
  id: number
  leaderEmployeeId: number | null
  createdAt: string
  updatedAt: string
}

export interface PositionRequest {
  departmentId: number
  code: string
  name: string
  description?: string | null
  status: EmployeeStatus
}

export interface Position extends PositionRequest {
  id: number
  departmentName: string | null
  description: string | null
  createdAt: string
  updatedAt: string
}
