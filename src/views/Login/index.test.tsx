import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { AuthService } from '../../api/user/auth'
import { ApiClientError } from '../../api/core'
import { AuthProvider } from '../../contexts/AuthContext'
import Login from './index'

const currentUser = {
  id: '1',
  username: 'admin',
  displayName: '管理员',
}

const createAuthService = (overrides: Partial<AuthService> = {}): AuthService => ({
  getCurrentUser: vi.fn().mockResolvedValue({
    currentUser,
    menus: [],
    permissionCodes: [],
  }),
  login: vi.fn().mockResolvedValue({
    token: 'new-token',
    currentUser,
    menus: [],
    permissionCodes: [],
  }),
  logout: vi.fn().mockResolvedValue(undefined),
  ...overrides,
})

const renderLogin = (authService: AuthService) =>
  render(
    <MemoryRouter initialEntries={['/login']}>
      <AuthProvider authService={authService}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<div>home page</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  )

describe('Login page', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        addEventListener: vi.fn(),
        addListener: vi.fn(),
        dispatchEvent: vi.fn(),
        matches: false,
        media: query,
        onchange: null,
        removeEventListener: vi.fn(),
        removeListener: vi.fn(),
      })),
    })
  })

  afterEach(() => {
    cleanup()
  })

  it('presents the enterprise workspace sign-in context', () => {
    const authService = createAuthService()

    renderLogin(authService)

    expect(screen.getByRole('heading', { name: '企业协同办公平台' })).toBeInTheDocument()
    expect(screen.getByText('统一身份认证')).toBeInTheDocument()
  })

  it('submits credentials and redirects after login succeeds', async () => {
    const authService = createAuthService()

    renderLogin(authService)

    await userEvent.type(screen.getByLabelText('用户名'), 'admin')
    await userEvent.type(screen.getByLabelText('密码'), 'password')
    await userEvent.click(screen.getByRole('button', { name: '登录' }))

    expect(await screen.findByText('home page')).toBeInTheDocument()
    expect(authService.login).toHaveBeenCalledWith({
      password: 'password',
      username: 'admin',
    })
  })

  it('shows backend message when login fails', async () => {
    const authService = createAuthService({
      login: vi.fn().mockRejectedValue(new ApiClientError('用户名或密码错误', 10001)),
    })

    renderLogin(authService)

    await userEvent.type(screen.getByLabelText('用户名'), 'admin')
    await userEvent.type(screen.getByLabelText('密码'), 'bad-password')
    await userEvent.click(screen.getByRole('button', { name: '登录' }))

    expect(await screen.findByText('用户名或密码错误')).toBeInTheDocument()
  })
})
