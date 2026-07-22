import { createContext } from 'react'
import type { LoginRequest, UserMenu, CurrentUser } from '../types/user'

export const AUTH_TOKEN_STORAGE_KEY = 'oa_auth_token'

export interface AuthContextValue {
  token: string | null
  currentUser: CurrentUser | null
  menus: UserMenu[]
  permissionCodes: string[]
  isAuthenticated: boolean
  isInitializing: boolean
  login(request: LoginRequest): Promise<void>
  logout(): Promise<void>
  hasPermission(permissionCode: string): boolean
}

export const AuthContext = createContext<AuthContextValue | null>(null)
