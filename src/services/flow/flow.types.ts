export type ApplicationType = 'LEAVE' | 'OVERTIME'
export type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
export type ApprovalAction = 'APPROVE' | 'REJECT'

export interface ApplicationRequest {
  startTime: string
  endTime: string
  reason: string
}

export interface FlowApplication {
  id: number
  applicationNo: string
  applicantId: number
  approverId: number
  applicationType: ApplicationType
  startTime: string
  endTime: string
  reason: string
  status: ApplicationStatus
  createdAt: string
  updatedAt: string
}

export interface ApprovalRequest {
  comment?: string | null
}

export interface ApprovalTask {
  applicationId: number
  applicationNo: string
  applicantId: number
  applicationType: ApplicationType
  action: ApprovalAction
  comment: string | null
  processedAt: string
}
