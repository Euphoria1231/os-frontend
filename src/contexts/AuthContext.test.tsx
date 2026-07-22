import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { AuthService } from '../api/user/auth'
import { AuthProvider } from './AuthContext'
import { useAuth } from './useAuth'

const currentUser = {
  id: '1',
  username: 'admin',
  displayName: '管理员',
}

const createAuthService = (overrides: Partial<AuthService> = {}): AuthService => ({
  getCurrentUser: vi.fn().mockResolvedValue({
    currentUser,
    menus: [],
    permissionCodes: ['system:user:list'],
  }),
  login: vi.fn().mockResolvedValue({
    token: 'new-token',
    currentUser,
    menus: [],
    permissionCodes: ['system:user:list'],
  }),
  logout: vi.fn().mockResolvedValue(undefined),
  ...overrides,
})

const renderWithAuth = (children: ReactNode, authService = createAuthService()) =>
  render(<AuthProvider authService={authService}>{children}</AuthProvider>)

const AuthStatus = () => {
  const { currentUser, hasPermission, isAuthenticated, isInitializing, login, logout, token } = useAuth()

  if (isInitializing) {
    return <div>initializing</div>
  }

  return (
    <div>
      <span>{isAuthenticated ? 'authenticated' : 'anonymous'}</span>
      <span>{currentUser?.displayName ?? 'no-user'}</span>
      <span>{token ?? 'no-token'}</span>
      <span>{hasPermission('system:user:list') ? 'allowed' : 'denied'}</span>
      <button onClick={() => login({ username: 'admin', password: 'password' })}>login</button>
      <button onClick={() => logout()}>logout</button>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    cleanup()
  })

  it('stores session after login succeeds', async () => {
    renderWithAuth(<AuthStatus />)

    await userEvent.click(await screen.findByRole('button', { name: 'login' }))

    expect(await screen.findByText('authenticated')).toBeInTheDocument()
    expect(screen.getByText('管理员')).toBeInTheDocument()
    expect(screen.getByText('new-token')).toBeInTheDocument()
    expect(screen.getByText('allowed')).toBeInTheDocument()
    expect(localStorage.getItem('oa_auth_token')).toBe('new-token')
  })

  it('restores current user by validating persisted token', async () => {
    localStorage.setItem('oa_auth_token', 'stored-token')
    const authService = createAuthService()

    renderWithAuth(<AuthStatus />, authService)

    expect(await screen.findByText('authenticated')).toBeInTheDocument()
    expect(screen.getByText('stored-token')).toBeInTheDocument()
    expect(authService.getCurrentUser).toHaveBeenCalledTimes(1)
  })

  it('clears local session when logout finishes', async () => {
    localStorage.setItem('oa_auth_token', 'stored-token')
    const authService = createAuthService()

    renderWithAuth(<AuthStatus />, authService)

    await screen.findByText('authenticated')
    await userEvent.click(screen.getByRole('button', { name: 'logout' }))

    await waitFor(() => expect(screen.getByText('anonymous')).toBeInTheDocument())
    expect(localStorage.getItem('oa_auth_token')).toBeNull()
  })
})
