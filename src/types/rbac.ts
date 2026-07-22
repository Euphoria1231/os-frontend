import type { RecordStatus } from './organization'

export interface Role {
  id: string
  name: string
  code: string
  status: RecordStatus
  remark?: string
  menuIds?: string[]
  apiPermissionIds?: string[]
  createdAt?: string
  updatedAt?: string
}

export interface RoleRequest {
  name: string
  code: string
  status: RecordStatus
  remark?: string
}

export interface MenuPermission {
  id: string
  title: string
  code: string
  path: string
  component?: string
  parentId?: string
  sortOrder: number
  status: RecordStatus
  permissionCode?: string
  createdAt?: string
  updatedAt?: string
}

export interface MenuPermissionRequest {
  title: string
  code: string
  path: string
  component?: string
  parentId?: string
  sortOrder: number
  status: RecordStatus
  permissionCode?: string
}

export interface ApiPermission {
  id: string
  name: string
  code: string
  method: HttpMethod
  path: string
  status: RecordStatus
  remark?: string
  createdAt?: string
  updatedAt?: string
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

export interface ApiPermissionRequest {
  name: string
  code: string
  method: HttpMethod
  path: string
  status: RecordStatus
  remark?: string
}

export interface AssignRoleMenusRequest {
  menuIds: string[]
}

export interface AssignRoleApiPermissionsRequest {
  apiPermissionIds: string[]
}
