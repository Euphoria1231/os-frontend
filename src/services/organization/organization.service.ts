import { http } from '../request.ts'
import type {
  Department,
  DepartmentRequest,
  Position,
  PositionRequest,
} from './organization.types.ts'

const DEPARTMENT_PATH = '/api/user/departments'
const POSITION_PATH = '/api/user/positions'

export const organizationService = {
  listDepartments: () => http.get<Department[]>(DEPARTMENT_PATH),
  createDepartment: (values: DepartmentRequest) =>
    http.post<Department, DepartmentRequest>(DEPARTMENT_PATH, values),
  updateDepartment: (id: number, values: DepartmentRequest) =>
    http.put<Department, DepartmentRequest>(`${DEPARTMENT_PATH}/${id}`, values),
  deleteDepartment: (id: number) => http.delete<void>(`${DEPARTMENT_PATH}/${id}`),
  listPositions: () => http.get<Position[]>(POSITION_PATH),
  createPosition: (values: PositionRequest) =>
    http.post<Position, PositionRequest>(POSITION_PATH, values),
  updatePosition: (id: number, values: PositionRequest) =>
    http.put<Position, PositionRequest>(`${POSITION_PATH}/${id}`, values),
  deletePosition: (id: number) => http.delete<void>(`${POSITION_PATH}/${id}`),
}
