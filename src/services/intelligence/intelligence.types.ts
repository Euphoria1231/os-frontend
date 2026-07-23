export type AiCallStatus = 'SUCCESS' | 'DEGRADED' | 'FAILED'

export interface ApprovalAnalysisResponse {
  analysisId: number | null
  callStatus: AiCallStatus
  applicationId: number
  applicationSummary: string
  riskWarnings: string[]
  suggestedDecision: string
  disclaimer: string
}

export interface AttendanceAnalysisResponse {
  analysisId: number | null
  callStatus: AiCallStatus
  employeeId: number
  month: string
  riskLevel: string
  abnormalSummary: string
  improvementSuggestions: string[]
  disclaimer: string
}

export interface OfficeQuestionRequest {
  question: string
}

export interface OfficeQuestionResponse {
  analysisId: number | null
  callStatus: AiCallStatus
  answer: string
  disclaimer: string
}

export interface AiAnalysisRecordResponse {
  id: number
  requestType: string
  businessReferenceId: string
  initiatorEmployeeId: number | null
  status: string
  durationMs: number
  resultSummary: string
  auditedAt: string
}

export interface AiStatusMeta {
  label: string
  color: 'success' | 'warning' | 'error'
  description: string
}
