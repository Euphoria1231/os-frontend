export type AttendanceStatus = 'NORMAL' | 'LATE'

export interface AttendanceRecord {
  id: number
  employeeId: number
  attendanceDate: string
  clockInTime: string | null
  clockOutTime: string | null
  attendanceStatus: AttendanceStatus
  createdAt: string
  updatedAt: string
}

export interface AttendanceRecordQuery {
  startDate: string
  endDate: string
}
