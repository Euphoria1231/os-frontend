import type { EmployeeStatus } from '../auth/auth.types.ts'

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
  code: string
  name: string
  description?: string | null
  status: EmployeeStatus
}

export interface Position extends PositionRequest {
  id: number
  description: string | null
  createdAt: string
  updatedAt: string
}
