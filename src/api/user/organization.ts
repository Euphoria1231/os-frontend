import { httpClient } from '../core'
import type {
  Department,
  DepartmentRequest,
  Position,
  PositionRequest,
} from '../../types/organization'

const DEPARTMENT_URL = '/api/user/departments'
const POSITION_URL = '/api/user/positions'

export const organizationApi = {
  createDepartment: (request: DepartmentRequest) =>
    httpClient.post<Department, DepartmentRequest>(DEPARTMENT_URL, request),
  createPosition: (request: PositionRequest) =>
    httpClient.post<Position, PositionRequest>(POSITION_URL, request),
  deleteDepartment: (id: string) => httpClient.delete<void>(`${DEPARTMENT_URL}/${id}`),
  deletePosition: (id: string) => httpClient.delete<void>(`${POSITION_URL}/${id}`),
  listDepartments: () => httpClient.get<Department[]>(DEPARTMENT_URL),
  listPositions: () => httpClient.get<Position[]>(POSITION_URL),
  updateDepartment: (id: string, request: DepartmentRequest) =>
    httpClient.put<Department, DepartmentRequest>(`${DEPARTMENT_URL}/${id}`, request),
  updatePosition: (id: string, request: PositionRequest) =>
    httpClient.put<Position, PositionRequest>(`${POSITION_URL}/${id}`, request),
}
