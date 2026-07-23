import { memo } from 'react'
import { Tag } from 'antd'
import type { EmployeeStatus } from '../../services/auth/auth.types.ts'

interface StatusTagProps {
  status: EmployeeStatus
}

export const StatusTag = memo(function StatusTag({ status }: StatusTagProps) {
  return status === 1 ? <Tag color="success">启用</Tag> : <Tag>停用</Tag>
})
