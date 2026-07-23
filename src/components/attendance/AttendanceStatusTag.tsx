import { memo } from 'react'
import { Tag } from 'antd'
import type { AttendanceStatus } from '../../services/attendance/attendance.types.ts'

interface AttendanceStatusTagProps {
  status: AttendanceStatus
}

export const AttendanceStatusTag = memo(function AttendanceStatusTag({
  status,
}: AttendanceStatusTagProps) {
  return status === 'LATE' ? <Tag color="warning">迟到</Tag> : <Tag color="success">正常</Tag>
})
