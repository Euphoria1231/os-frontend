import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { configureRequestAuth } from '../../services/request.ts'
import { authService } from '../../services/auth/auth.service.ts'
import type { Employee, LoginRequest } from '../../services/auth/auth.types.ts'
import {
  clearStoredAccessToken,
  getStoredAccessToken,
  storeAccessToken,
} from '../../utils/auth-storage.ts'
import { decodeJwtPayload } from '../../utils/jwt.ts'
import { AuthContext } from './auth-context.ts'
import type { AuthProviderProps } from './auth-context.types.ts'

const EMPTY_VALUES = new Set<string>()

function getTokenValues(token: string | null): { roles: Set<string>; permissions: Set<string> } {
  const payload = token ? decodeJwtPayload(token) : null
  return {
    roles: new Set(payload?.roles ?? []),
    permissions: new Set(payload?.permissions ?? []),
  }
}

export function AuthProvider({ children }: AuthProviderProps) {
  const initialToken = useMemo(() => getStoredAccessToken(), [])
  const initialValues = useMemo(() => getTokenValues(initialToken), [initialToken])
  const [token, setToken] = useState<string | null>(initialToken)
  const [user, setUser] = useState<Employee | null>(null)
  const [roles, setRoles] = useState<ReadonlySet<string>>(initialValues.roles)
  const [permissions, setPermissions] = useState<ReadonlySet<string>>(initialValues.permissions)
  const [isInitializing, setIsInitializing] = useState(Boolean(initialToken))
  const tokenRef = useRef(token)

  const clearSession = useCallback(() => {
    tokenRef.current = null
    clearStoredAccessToken()
    setToken(null)
    setUser(null)
    setRoles(EMPTY_VALUES)
    setPermissions(EMPTY_VALUES)
  }, [])

  useEffect(() => {
    configureRequestAuth({
      getAccessToken: () => tokenRef.current,
      onUnauthorized: clearSession,
    })
  }, [clearSession])

  useEffect(() => {
    if (!initialToken) {
      return
    }

    let active = true

    authService
      .getCurrentUser()
      .then((currentUser) => {
        if (active) {
          setUser(currentUser)
        }
      })
      .catch(() => {
        if (active) {
          clearSession()
        }
      })
      .finally(() => {
        if (active) {
          setIsInitializing(false)
        }
      })

    return () => {
      active = false
    }
  }, [clearSession, initialToken])

  const login = useCallback(async (values: LoginRequest) => {
    const response = await authService.login(values)
    const nextValues = getTokenValues(response.accessToken)

    storeAccessToken(response.accessToken)
    tokenRef.current = response.accessToken
    setToken(response.accessToken)
    setUser(response.employee)
    setRoles(nextValues.roles)
    setPermissions(nextValues.permissions)
  }, [])

  const logout = useCallback(async () => {
    try {
      if (tokenRef.current) {
        await authService.logout()
      }
    } finally {
      clearSession()
    }
  }, [clearSession])

  const isSuperAdmin = roles.has('SUPER_ADMIN')
  const hasAuthority = useCallback(
    (authority: string) => isSuperAdmin || permissions.has(authority),
    [isSuperAdmin, permissions],
  )

  const value = useMemo(
    () => ({
      user,
      token,
      roles,
      permissions,
      isAuthenticated: Boolean(token && user),
      isInitializing,
      isSuperAdmin,
      login,
      logout,
      hasAuthority,
    }),
    [
      hasAuthority,
      isInitializing,
      isSuperAdmin,
      login,
      logout,
      permissions,
      roles,
      token,
      user,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
