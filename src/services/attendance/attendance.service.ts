import { http } from '../request.ts'
import type {
  AttendanceRecord,
  AttendanceRecordQuery,
  MakeupQuota,
  MakeupQuotaAssignmentRequest,
} from './attendance.types.ts'

const ATTENDANCE_PATH = '/api/attendance'

export const attendanceService = {
  getToday: () => http.get<AttendanceRecord>(`${ATTENDANCE_PATH}/today`),
  clockIn: () => http.post<AttendanceRecord>(`${ATTENDANCE_PATH}/clock-in`),
  clockOut: () => http.post<AttendanceRecord>(`${ATTENDANCE_PATH}/clock-out`),
  listRecords: (query: AttendanceRecordQuery) =>
    http.get<AttendanceRecord[]>(`${ATTENDANCE_PATH}/records`, { params: query }),
  getMyMakeupQuota: (quotaMonth: string) =>
    http.get<MakeupQuota>(`${ATTENDANCE_PATH}/makeup-quotas/mine`, {
      params: { quotaMonth },
    }),
  assignMakeupQuota: (employeeId: number, values: MakeupQuotaAssignmentRequest) =>
    http.put<MakeupQuota, MakeupQuotaAssignmentRequest>(
      `${ATTENDANCE_PATH}/makeup-quotas/${employeeId}`,
      values,
    ),
}
