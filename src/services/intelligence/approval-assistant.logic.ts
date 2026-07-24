import type { FlowApplication } from '../flow/flow.types.ts'
import { getApprovalCandidates } from './intelligence.logic.ts'

export type LeaveApprovalApplication = FlowApplication & { applicationType: 'LEAVE' }

export function getLeaveApprovalCandidates(
  todoApplications: FlowApplication[],
): LeaveApprovalApplication[] {
  return getApprovalCandidates(todoApplications).filter(
    (application): application is LeaveApprovalApplication => application.applicationType === 'LEAVE',
  )
}
