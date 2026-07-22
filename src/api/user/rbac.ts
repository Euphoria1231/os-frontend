import { httpClient } from '../core'
import type {
  ApiPermission,
  ApiPermissionRequest,
  AssignRoleApiPermissionsRequest,
  AssignRoleMenusRequest,
  MenuPermission,
  MenuPermissionRequest,
  Role,
  RoleRequest,
} from '../../types/rbac'

const ROLE_URL = '/api/user/roles'
const MENU_URL = '/api/user/menus'
const API_PERMISSION_URL = '/api/user/api-permissions'

export const rbacApi = {
  assignRoleApiPermissions: (roleId: string, apiPermissionIds: string[]) =>
    httpClient.put<void, AssignRoleApiPermissionsRequest>(`${ROLE_URL}/${roleId}/api-permissions`, {
      apiPermissionIds,
    }),
  assignRoleMenus: (roleId: string, menuIds: string[]) =>
    httpClient.put<void, AssignRoleMenusRequest>(`${ROLE_URL}/${roleId}/menus`, {
      menuIds,
    }),
  createApiPermission: (request: ApiPermissionRequest) =>
    httpClient.post<ApiPermission, ApiPermissionRequest>(API_PERMISSION_URL, request),
  createMenu: (request: MenuPermissionRequest) =>
    httpClient.post<MenuPermission, MenuPermissionRequest>(MENU_URL, request),
  createRole: (request: RoleRequest) => httpClient.post<Role, RoleRequest>(ROLE_URL, request),
  deleteApiPermission: (id: string) => httpClient.delete<void>(`${API_PERMISSION_URL}/${id}`),
  deleteMenu: (id: string) => httpClient.delete<void>(`${MENU_URL}/${id}`),
  deleteRole: (id: string) => httpClient.delete<void>(`${ROLE_URL}/${id}`),
  listApiPermissions: () => httpClient.get<ApiPermission[]>(API_PERMISSION_URL),
  listMenus: () => httpClient.get<MenuPermission[]>(MENU_URL),
  listRoles: () => httpClient.get<Role[]>(ROLE_URL),
  updateApiPermission: (id: string, request: ApiPermissionRequest) =>
    httpClient.put<ApiPermission, ApiPermissionRequest>(`${API_PERMISSION_URL}/${id}`, request),
  updateMenu: (id: string, request: MenuPermissionRequest) =>
    httpClient.put<MenuPermission, MenuPermissionRequest>(`${MENU_URL}/${id}`, request),
  updateRole: (id: string, request: RoleRequest) =>
    httpClient.put<Role, RoleRequest>(`${ROLE_URL}/${id}`, request),
}
