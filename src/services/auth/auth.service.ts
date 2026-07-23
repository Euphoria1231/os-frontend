import { http } from '../request.ts'
import type { Employee, LoginRequest, LoginResponse } from './auth.types.ts'

const AUTH_BASE_PATH = '/api/user/auth'

export const authService = {
  login: (values: LoginRequest) =>
    http.post<LoginResponse, LoginRequest>(`${AUTH_BASE_PATH}/login`, values),
  logout: () => http.post<void>(`${AUTH_BASE_PATH}/logout`),
  getCurrentUser: () => http.get<Employee>(`${AUTH_BASE_PATH}/me`),
}
