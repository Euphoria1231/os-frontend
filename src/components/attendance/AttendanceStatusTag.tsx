import { memo } from 'react'
import { Tag } from 'antd'
import type { AttendanceStatus } from '../../services/attendance/attendance.types.ts'

interface AttendanceStatusTagProps {
  status: AttendanceStatus
}

export const AttendanceStatusTag = memo(function AttendanceStatusTag({
  status,
}: AttendanceStatusTagProps) {
  if (status === 'LATE') return <Tag color="warning">迟到</Tag>
  if (status === 'ABSENT') return <Tag color="error">旷工</Tag>
  if (status === 'EARLY_LEAVE') return <Tag color="orange">早退</Tag>
  if (status === 'MAKEUP') return <Tag color="cyan">已补签</Tag>
  return <Tag color="success">正常</Tag>
})
