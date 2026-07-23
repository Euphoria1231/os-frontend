import { memo } from 'react'
import { Tag } from 'antd'
import type {
  ApplicationStatus,
  ApplicationType,
  ApprovalAction,
} from '../../services/flow/flow.types.ts'

export const ApplicationTypeTag = memo(function ApplicationTypeTag({
  type,
}: {
  type: ApplicationType
}) {
  if (type === 'LEAVE') return <Tag color="blue">请假</Tag>
  if (type === 'OVERTIME') return <Tag color="gold">加班</Tag>
  return <Tag color="cyan">补签</Tag>
})

export const ApplicationStatusTag = memo(function ApplicationStatusTag({
  status,
}: {
  status: ApplicationStatus
}) {
  if (status === 'APPROVED') return <Tag color="success">已同意</Tag>
  if (status === 'REJECTED') return <Tag color="error">已驳回</Tag>
  return <Tag color="processing">审批中</Tag>
})

export const ApprovalActionTag = memo(function ApprovalActionTag({
  action,
}: {
  action: ApprovalAction
}) {
  return action === 'APPROVE' ? <Tag color="success">同意</Tag> : <Tag color="error">驳回</Tag>
})
