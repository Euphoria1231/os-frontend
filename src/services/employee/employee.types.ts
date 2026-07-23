export type EmployeeStatus = 0 | 1

export interface Employee {
  id: number
  employeeNo: string
  username: string
  realName: string
  departmentId: number
  departmentName: string | null
  positionId: number
  positionName: string | null
  leaderId: number | null
  leaderName: string | null
  phone: string | null
  email: string | null
  status: EmployeeStatus
  createdAt: string
  updatedAt: string
}

export interface EmployeeCreateRequest {
  employeeNo: string
  username: string
  password: string
  realName: string
  departmentId: number
  positionId: number
  leaderId?: number | null
  phone?: string | null
  email?: string | null
  status: EmployeeStatus
}

export interface EmployeeUpdateRequest {
  realName: string
  departmentId: number
  positionId: number
  leaderId?: number | null
  phone?: string | null
  email?: string | null
  status: EmployeeStatus
}

export type EmployeeFormValues = Omit<EmployeeCreateRequest, 'departmentId' | 'positionId'> & {
  departmentId?: number
  positionId?: number
}
