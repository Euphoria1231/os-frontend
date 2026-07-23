import { http } from '../request.ts'
import type {
  Employee,
  EmployeeCreateRequest,
  EmployeeUpdateRequest,
} from './employee.types.ts'

const EMPLOYEE_PATH = '/api/user/employees'

export const employeeService = {
  listEmployees: () => http.get<Employee[]>(EMPLOYEE_PATH),
  createEmployee: (values: EmployeeCreateRequest) =>
    http.post<Employee, EmployeeCreateRequest>(EMPLOYEE_PATH, values),
  updateEmployee: (id: number, values: EmployeeUpdateRequest) =>
    http.put<Employee, EmployeeUpdateRequest>(`${EMPLOYEE_PATH}/${id}`, values),
  deleteEmployee: (id: number) => http.delete<void>(`${EMPLOYEE_PATH}/${id}`),
}
