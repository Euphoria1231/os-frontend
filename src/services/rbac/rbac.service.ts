import { http } from '../request.ts'
import type {
  ApiPermission,
  ApiPermissionRequest,
  EmployeeAuthorization,
  EmployeeRoleRequest,
  MenuPermission,
  MenuPermissionRequest,
  Role,
  RoleGrantRequest,
  RoleGrantResponse,
  RoleRequest,
} from './rbac.types.ts'

const ROLE_PATH = '/api/user/roles'
const MENU_PATH = '/api/user/menus'
const API_PERMISSION_PATH = '/api/user/api-permissions'
const EMPLOYEE_PATH = '/api/user/employees'

export const rbacService = {
  listRoles: () => http.get<Role[]>(ROLE_PATH),
  createRole: (values: RoleRequest) => http.post<Role, RoleRequest>(ROLE_PATH, values),
  updateRole: (id: number, values: RoleRequest) =>
    http.put<Role, RoleRequest>(`${ROLE_PATH}/${id}`, values),
  deleteRole: (id: number) => http.delete<void>(`${ROLE_PATH}/${id}`),
  getRolePermissions: (roleId: number) =>
    http.get<RoleGrantResponse>(`${ROLE_PATH}/${roleId}/permissions`),
  assignRolePermissions: (roleId: number, values: RoleGrantRequest) =>
    http.put<void, RoleGrantRequest>(`${ROLE_PATH}/${roleId}/permissions`, values),
  listMenus: () => http.get<MenuPermission[]>(MENU_PATH),
  createMenu: (values: MenuPermissionRequest) =>
    http.post<MenuPermission, MenuPermissionRequest>(MENU_PATH, values),
  updateMenu: (id: number, values: MenuPermissionRequest) =>
    http.put<MenuPermission, MenuPermissionRequest>(`${MENU_PATH}/${id}`, values),
  deleteMenu: (id: number) => http.delete<void>(`${MENU_PATH}/${id}`),
  listApiPermissions: () => http.get<ApiPermission[]>(API_PERMISSION_PATH),
  createApiPermission: (values: ApiPermissionRequest) =>
    http.post<ApiPermission, ApiPermissionRequest>(API_PERMISSION_PATH, values),
  updateApiPermission: (id: number, values: ApiPermissionRequest) =>
    http.put<ApiPermission, ApiPermissionRequest>(`${API_PERMISSION_PATH}/${id}`, values),
  deleteApiPermission: (id: number) => http.delete<void>(`${API_PERMISSION_PATH}/${id}`),
  getEmployeeAuthorization: (employeeId: number) =>
    http.get<EmployeeAuthorization>(`${EMPLOYEE_PATH}/${employeeId}/permissions`),
  assignEmployeeRoles: (employeeId: number, roleIds: number[]) =>
    http.put<void, EmployeeRoleRequest>(`${EMPLOYEE_PATH}/${employeeId}/roles`, { roleIds }),
}
