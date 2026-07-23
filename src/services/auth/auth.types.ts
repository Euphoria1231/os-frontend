import type { Employee } from '../employee/employee.types.ts'

export type { Employee, EmployeeStatus } from '../employee/employee.types.ts'

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
