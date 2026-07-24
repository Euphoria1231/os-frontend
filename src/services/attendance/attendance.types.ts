export type AttendanceStatus = 'NORMAL' | 'LATE' | 'ABSENT' | 'EARLY_LEAVE' | 'MAKEUP'

export interface AttendanceRecord {
  id: number
  employeeId: number
  attendanceDate: string
  clockInTime: string | null
  clockOutTime: string | null
  attendanceStatus: AttendanceStatus
  originalAttendanceStatus: AttendanceStatus | null
  makeupApplicationId: number | null
  createdAt: string
  updatedAt: string
}

export interface AttendanceRecordQuery {
  startDate: string
  endDate: string
}

export interface ClockLocation {
  longitude: number
  latitude: number
}

export interface AttendanceClockConfig {
  morningStartTime: string
  morningEndTime: string
  afternoonStartTime: string
  afternoonEndTime: string
  centerLongitude: number
  centerLatitude: number
  radiusMeters: number
}

export interface MakeupQuota {
  employeeId: number
  quotaMonth: string
  totalCount: number
  usedCount: number
  remainingCount: number
  assignedBy: number
}

export interface MakeupQuotaAssignmentRequest {
  quotaMonth: string
  totalCount: number
}
