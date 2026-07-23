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

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  tokenType: 'Bearer'
  expiresIn: number
  employee: Employee
}
