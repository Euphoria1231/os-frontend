import type { ReactElement, ReactNode } from 'react'
import { cloneElement, isValidElement } from 'react'
import { useAuth } from '../../contexts/useAuth'

export interface RequirePermissionProps {
  children: ReactNode
  fallback?: ReactNode
  mode?: 'fallback' | 'hidden' | 'disabled'
  permissionCode?: string
}

const RequirePermission = ({
  children,
  fallback = null,
  mode = 'fallback',
  permissionCode,
}: RequirePermissionProps) => {
  const { hasPermission } = useAuth()

  if (!permissionCode || hasPermission(permissionCode)) {
    return children
  }

  if (mode === 'hidden') {
    return null
  }

  if (mode === 'disabled' && isValidElement(children)) {
    return cloneElement(children as ReactElement<{ disabled?: boolean }>, { disabled: true })
  }

  return fallback
}

export default RequirePermission
