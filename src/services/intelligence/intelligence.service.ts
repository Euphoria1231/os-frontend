import { http } from '../request.ts'
import { buildOfficeQuestionRequest } from './intelligence.logic.ts'
import type {
  AiAnalysisRecordResponse,
  ApprovalAnalysisResponse,
  AttendanceAnalysisResponse,
  OfficeQuestionRequest,
  OfficeQuestionResponse,
} from './intelligence.types.ts'

const AI_PATH = '/api/intelligence/ai'

export const intelligenceService = {
  analyzeApproval: (applicationId: number) =>
    http.post<ApprovalAnalysisResponse>(`${AI_PATH}/approvals/${applicationId}/analysis`),
  analyzeAttendance: (employeeId: number, month: string) =>
    http.post<AttendanceAnalysisResponse>(`${AI_PATH}/attendance/${employeeId}/analysis`, undefined, {
      params: { month },
    }),
  askOfficeQuestion: (question: string) =>
    http.post<OfficeQuestionResponse, OfficeQuestionRequest>(
      `${AI_PATH}/office/ask`,
      buildOfficeQuestionRequest(question),
    ),
  getAnalysis: (id: number) =>
    http.get<AiAnalysisRecordResponse>(`${AI_PATH}/analyses/${id}`),
}
