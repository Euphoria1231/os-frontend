import type { EmployeeStatus } from '../employee/employee.types.ts'

export interface Role {
  id: number
  code: string
  name: string
  status: EmployeeStatus
  createdAt: string
  updatedAt: string
}

export interface MenuPermission {
  id: number
  parentId: number
  name: string
  path: string | null
  component: string | null
  permission: string | null
  type: 'DIRECTORY' | 'MENU' | 'BUTTON'
  sortOrder: number
  status: EmployeeStatus
  createdAt: string
  updatedAt: string
}

export interface ApiPermission {
  id: number
  code: string
  name: string
  httpMethod: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  pathPattern: string
  authority: string
  status: EmployeeStatus
  createdAt: string
  updatedAt: string
}

export interface EmployeeAuthorization {
  roles: Role[]
  menus: MenuPermission[]
  apiPermissions: ApiPermission[]
}

export interface EmployeeRoleRequest {
  roleIds: number[]
}
