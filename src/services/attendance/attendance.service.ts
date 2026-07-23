import { http } from '../request.ts'
import type {
  AttendanceClockConfig,
  AttendanceRecord,
  AttendanceRecordQuery,
  ClockLocation,
  MakeupQuota,
  MakeupQuotaAssignmentRequest,
} from './attendance.types.ts'

const ATTENDANCE_PATH = '/api/attendance'

export const attendanceService = {
  getToday: () => http.get<AttendanceRecord>(`${ATTENDANCE_PATH}/today`),
  getClockConfig: () =>
    http.get<AttendanceClockConfig>(`${ATTENDANCE_PATH}/clock-config`),
  clockIn: (location: ClockLocation) =>
    http.post<AttendanceRecord, ClockLocation>(`${ATTENDANCE_PATH}/clock-in`, location),
  clockOut: (location: ClockLocation) =>
    http.post<AttendanceRecord, ClockLocation>(`${ATTENDANCE_PATH}/clock-out`, location),
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
