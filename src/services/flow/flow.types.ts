export type ApplicationType = 'LEAVE' | 'OVERTIME' | 'MAKEUP'
export type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
export type ApprovalAction = 'APPROVE' | 'REJECT'
export type ApprovalTaskStatus =
  | 'WAITING'
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED'

export interface ApplicationRequest {
  startTime: string
  endTime: string
  reason: string
}

export interface MakeupApplicationRequest {
  attendanceRecordId: number
  reason: string
}

export interface FlowApplication {
  id: number
  applicationNo: string
  applicantId: number
  approverId: number
  applicationType: ApplicationType
  attendanceRecordId: number | null
  startTime: string | null
  endTime: string | null
  reason: string
  status: ApplicationStatus
  createdAt: string
  updatedAt: string
  approvalProgress: ApprovalProgress[]
}

export interface ApprovalProgress {
  taskId: number
  approvalLevel: number
  approverId: number
  approverName: string
  status: ApprovalTaskStatus
  action: ApprovalAction | null
  comment: string | null
  activatedAt: string | null
  processedAt: string | null
}

export interface ApprovalRequest {
  comment?: string | null
}

export interface ApprovalTask {
  taskId: number
  applicationId: number
  applicationNo: string
  applicantId: number
  applicationType: ApplicationType
  approvalLevel: number
  approverId: number
  approverName: string
  status: ApprovalTaskStatus
  action: ApprovalAction
  comment: string | null
  activatedAt: string | null
  processedAt: string | null
}
