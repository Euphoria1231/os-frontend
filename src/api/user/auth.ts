import { httpClient, type HttpClient } from '../core'
import type { AuthProfile, LoginRequest, LoginResponse } from '../../types/user'

export interface AuthService {
  getCurrentUser(): Promise<AuthProfile>
  login(request: LoginRequest): Promise<LoginResponse>
  logout(): Promise<void>
}

export const createAuthService = (client: HttpClient = httpClient): AuthService => ({
  getCurrentUser: () => client.get<AuthProfile>('/api/user/auth/me'),
  login: (request) => client.post<LoginResponse, LoginRequest>('/api/user/auth/login', request),
  logout: () => client.post<void>('/api/user/auth/logout'),
})

export const authService = createAuthService()
