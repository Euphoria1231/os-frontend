import type { ReactNode } from 'react'
import type { Employee, LoginRequest } from '../../services/auth/auth.types.ts'

export interface AuthContextValue {
  user: Employee | null
  token: string | null
  roles: ReadonlySet<string>
  permissions: ReadonlySet<string>
  isAuthenticated: boolean
  isInitializing: boolean
  isSuperAdmin: boolean
  login: (values: LoginRequest) => Promise<void>
  logout: () => Promise<void>
  hasAuthority: (authority: string) => boolean
}

export interface AuthProviderProps {
  children: ReactNode
}
