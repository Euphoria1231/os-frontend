import type { AttendanceStatus } from '../../services/attendance/attendance.types.ts'

export type MakeupActionState = 'AVAILABLE' | 'PENDING' | 'UNAVAILABLE' | 'COMPLETED' | 'HIDDEN'

interface MakeupActionContext {
  attendanceStatus: AttendanceStatus
  canSubmit: boolean
  hasActiveApplication: boolean
  remainingCount: number | null | undefined
}

export function resolveMakeupActionState(
  context: MakeupActionContext,
): MakeupActionState {
  if (
    !context.canSubmit
    || (context.attendanceStatus !== 'LATE' && context.attendanceStatus !== 'MAKEUP')
  ) {
    return 'HIDDEN'
  }
  if (context.attendanceStatus === 'MAKEUP') {
    return 'COMPLETED'
  }
  if (context.hasActiveApplication) {
    return 'PENDING'
  }
  if (context.remainingCount === null || context.remainingCount === 0) {
    return 'UNAVAILABLE'
  }
  return 'AVAILABLE'
}

export function buildMakeupApplicationRequest(
  attendanceRecordId: number,
  reason: string,
) {
  return { attendanceRecordId, reason: reason.trim() }
}
