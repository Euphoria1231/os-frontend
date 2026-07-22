import { httpClient } from '../core'
import type {
  AssignEmployeeRolesRequest,
  Employee,
  EmployeePermissionSummary,
  EmployeeQuery,
  EmployeeRequest,
  RoleSummary,
} from '../../types/employee'

const EMPLOYEE_URL = '/api/user/employees'
const ROLE_URL = '/api/user/roles'

export const employeeApi = {
  assignRoles: (id: string, roleIds: string[]) =>
    httpClient.put<void, AssignEmployeeRolesRequest>(`${EMPLOYEE_URL}/${id}/roles`, { roleIds }),
  createEmployee: (request: EmployeeRequest) =>
    httpClient.post<Employee, EmployeeRequest>(EMPLOYEE_URL, request),
  deleteEmployee: (id: string) => httpClient.delete<void>(`${EMPLOYEE_URL}/${id}`),
  getEmployeePermissions: (id: string) =>
    httpClient.get<EmployeePermissionSummary>(`${EMPLOYEE_URL}/${id}/permissions`),
  listEmployees: (query?: EmployeeQuery) =>
    httpClient.get<Employee[]>(EMPLOYEE_URL, {
      params: query,
    }),
  listRoles: () => httpClient.get<RoleSummary[]>(ROLE_URL),
  updateEmployee: (id: string, request: EmployeeRequest) =>
    httpClient.put<Employee, EmployeeRequest>(`${EMPLOYEE_URL}/${id}`, request),
}
