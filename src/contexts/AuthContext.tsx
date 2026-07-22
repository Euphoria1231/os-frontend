import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { clearHttpClientAuth, setHttpClientAuth } from '../api/core'
import { authService as defaultAuthService, type AuthService } from '../api/user/auth'
import { AuthContext, AUTH_TOKEN_STORAGE_KEY, type AuthContextValue } from './authContextValue'
import type { AuthProfile, LoginRequest } from '../types/user'

export interface AuthProviderProps {
  authService?: AuthService
  children: ReactNode
}

interface AuthState extends AuthProfile {
  token: string
}

const readStoredToken = () => localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)

const persistToken = (token: string) => {
  localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token)
}

const removeStoredToken = () => {
  localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
}

export const AuthProvider = ({ authService = defaultAuthService, children }: AuthProviderProps) => {
  const [authState, setAuthState] = useState<AuthState | null>(null)
  const [isInitializing, setIsInitializing] = useState(() => Boolean(readStoredToken()))
  const authServiceRef = useRef(authService)
  const tokenRef = useRef<string | null>(readStoredToken())

  useEffect(() => {
    authServiceRef.current = authService
  }, [authService])

  const clearSession = useCallback(() => {
    tokenRef.current = null
    removeStoredToken()
    setAuthState(null)
  }, [])

  useEffect(() => {
    setHttpClientAuth({
      onUnauthorized: clearSession,
      tokenProvider: () => tokenRef.current,
    })

    return () => {
      clearHttpClientAuth()
    }
  }, [clearSession])

  useEffect(() => {
    let isActive = true
    const storedToken = readStoredToken()
    tokenRef.current = storedToken

    if (!storedToken) {
      return () => {
        isActive = false
      }
    }

    authServiceRef.current
      .getCurrentUser()
      .then((profile) => {
        if (!isActive) {
          return
        }

        setAuthState({
          ...profile,
          token: storedToken,
        })
      })
      .catch(() => {
        if (isActive) {
          removeStoredToken()
          setAuthState(null)
        }
      })
      .finally(() => {
        if (isActive) {
          setIsInitializing(false)
        }
      })

    return () => {
      isActive = false
    }
  }, [])

  const login = useCallback(async (request: LoginRequest) => {
    const session = await authServiceRef.current.login(request)

    tokenRef.current = session.token
    persistToken(session.token)
    setAuthState(session)
  }, [])

  const logout = useCallback(async () => {
    try {
      await authServiceRef.current.logout()
    } finally {
      clearSession()
    }
  }, [clearSession])

  const hasPermission = useCallback(
    (permissionCode: string) => authState?.permissionCodes.includes(permissionCode) ?? false,
    [authState?.permissionCodes],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      token: authState?.token ?? null,
      currentUser: authState?.currentUser ?? null,
      menus: authState?.menus ?? [],
      permissionCodes: authState?.permissionCodes ?? [],
      isAuthenticated: Boolean(authState?.token),
      isInitializing,
      login,
      logout,
      hasPermission,
    }),
    [authState, hasPermission, isInitializing, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
