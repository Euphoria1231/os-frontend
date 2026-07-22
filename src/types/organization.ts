export type RecordStatus = 'enabled' | 'disabled'

export interface Department {
  id: string
  name: string
  code: string
  parentId?: string
  leaderName?: string
  phone?: string
  sortOrder: number
  status: RecordStatus
  createdAt?: string
  updatedAt?: string
}

export interface DepartmentRequest {
  name: string
  code: string
  parentId?: string
  leaderName?: string
  phone?: string
  sortOrder: number
  status: RecordStatus
}

export interface Position {
  id: string
  name: string
  code: string
  departmentId?: string
  departmentName?: string
  sortOrder: number
  status: RecordStatus
  remark?: string
  createdAt?: string
  updatedAt?: string
}

export interface PositionRequest {
  name: string
  code: string
  departmentId?: string
  sortOrder: number
  status: RecordStatus
  remark?: string
}
