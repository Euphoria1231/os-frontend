import type { EmployeeStatus } from '../employee/employee.types.ts'

export interface Role {
  id: number
  code: string
  name: string
  status: EmployeeStatus
  createdAt: string
  updatedAt: string
}

export interface RoleRequest {
  code: string
  name: string
  status: EmployeeStatus
}

export interface RoleGrantRequest {
  menuIds: number[]
  apiPermissionIds: number[]
}

export type MenuType = 'DIRECTORY' | 'MENU' | 'BUTTON'

export interface MenuPermission {
  id: number
  parentId: number
  name: string
  path: string | null
  component: string | null
  permission: string | null
  type: MenuType
  sortOrder: number
  status: EmployeeStatus
  createdAt: string
  updatedAt: string
}

export interface MenuPermissionRequest {
  parentId: number
  name: string
  path?: string | null
  component?: string | null
  permission?: string | null
  type: MenuType
  sortOrder: number
  status: EmployeeStatus
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

export interface ApiPermission {
  id: number
  code: string
  name: string
  httpMethod: HttpMethod
  pathPattern: string
  authority: string
  status: EmployeeStatus
  createdAt: string
  updatedAt: string
}

export interface ApiPermissionRequest {
  code: string
  name: string
  httpMethod: HttpMethod
  pathPattern: string
  status: EmployeeStatus
}

export interface EmployeeAuthorization {
  roles: Role[]
  menus: MenuPermission[]
  apiPermissions: ApiPermission[]
}

export interface EmployeeRoleRequest {
  roleIds: number[]
}
