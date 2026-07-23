import { memo, type ReactNode } from 'react'
import { Spin, Typography } from 'antd'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/auth/useAuth.ts'
import './ProtectedRoute.less'

interface ProtectedRouteProps {
  children: ReactNode
}

export const ProtectedRoute = memo(function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation()
  const { isAuthenticated, isInitializing } = useAuth()

  if (isInitializing) {
    return (
      <main className="auth-loading-page">
        <span className="auth-loading-logo" aria-hidden="true">
          OA
        </span>
        <Spin size="large" />
        <Typography.Text type="secondary">正在恢复登录状态</Typography.Text>
      </main>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children
})
