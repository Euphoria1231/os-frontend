import { memo, type ReactNode } from 'react'
import { LockOutlined } from '@ant-design/icons'
import { Result } from 'antd'
import { useAuth } from '../../hooks/auth/useAuth.ts'

interface PermissionGateProps {
  authority: string | readonly string[]
  children: ReactNode
  mode?: 'all' | 'any'
  fallback?: ReactNode
  showDenied?: boolean
}

export const PermissionGate = memo(function PermissionGate({
  authority,
  children,
  mode = 'all',
  fallback = null,
  showDenied = false,
}: PermissionGateProps) {
  const { hasAuthority } = useAuth()
  const authorities = typeof authority === 'string' ? [authority] : authority
  const allowed =
    mode === 'all' ? authorities.every(hasAuthority) : authorities.some(hasAuthority)

  if (allowed) {
    return children
  }

  if (showDenied) {
    return (
      <Result
        status="403"
        icon={<LockOutlined />}
        title="无权访问该模块"
        subTitle="当前账号未获得该功能的接口权限，请联系系统管理员。"
      />
    )
  }

  return fallback
})
