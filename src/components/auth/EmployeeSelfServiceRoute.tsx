import { memo, type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/auth/useAuth.ts'
import { canAccessEmployeeSelfServicePath } from './employee-self-service.logic.ts'

interface EmployeeSelfServiceRouteProps {
  children: ReactNode
}

export const EmployeeSelfServiceRoute = memo(function EmployeeSelfServiceRoute({
  children,
}: EmployeeSelfServiceRouteProps) {
  const location = useLocation()
  const { isSuperAdmin } = useAuth()

  if (!canAccessEmployeeSelfServicePath(location.pathname, isSuperAdmin)) {
    return <Navigate to="/workspace" replace />
  }

  return children
})
