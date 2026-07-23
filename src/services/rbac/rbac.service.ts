import { http } from '../request.ts'
import type {
  EmployeeAuthorization,
  EmployeeRoleRequest,
  Role,
} from './rbac.types.ts'

const ROLE_PATH = '/api/user/roles'
const EMPLOYEE_PATH = '/api/user/employees'

export const rbacService = {
  listRoles: () => http.get<Role[]>(ROLE_PATH),
  getEmployeeAuthorization: (employeeId: number) =>
    http.get<EmployeeAuthorization>(`${EMPLOYEE_PATH}/${employeeId}/permissions`),
  assignEmployeeRoles: (employeeId: number, roleIds: number[]) =>
    http.put<void, EmployeeRoleRequest>(`${EMPLOYEE_PATH}/${employeeId}/roles`, { roleIds }),
}
