import { useCallback, useEffect, useState } from 'react'
import { attendanceService } from '../../services/attendance/attendance.service.ts'
import type { AttendanceRecord } from '../../services/attendance/attendance.types.ts'
import { RequestError } from '../../services/request.ts'

const TODAY_RECORD_NOT_FOUND = 40401

async function getTodayOrNull(): Promise<AttendanceRecord | null> {
  try {
    return await attendanceService.getToday()
  } catch (error) {
    if (error instanceof RequestError && error.code === TODAY_RECORD_NOT_FOUND) {
      return null
    }
    throw error
  }
}

export function useAttendance(startDate: string, endDate: string) {
  const [today, setToday] = useState<AttendanceRecord | null>(null)
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown>(null)

  useEffect(() => {
    let active = true

    Promise.all([
      getTodayOrNull(),
      attendanceService.listRecords({ startDate, endDate }),
    ])
      .then(([todayRecord, recordList]) => {
        if (active) {
          setToday(todayRecord)
          setRecords(recordList)
          setError(null)
        }
      })
      .catch((requestError: unknown) => {
        if (active) {
          setError(requestError)
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [endDate, startDate])

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [todayRecord, recordList] = await Promise.all([
        getTodayOrNull(),
        attendanceService.listRecords({ startDate, endDate }),
      ])
      setToday(todayRecord)
      setRecords(recordList)
    } catch (requestError) {
      setError(requestError)
    } finally {
      setLoading(false)
    }
  }, [endDate, startDate])

  const refreshRecords = useCallback(async () => {
    try {
      setRecords(await attendanceService.listRecords({ startDate, endDate }))
    } catch (requestError) {
      setError(requestError)
    }
  }, [endDate, startDate])

  const clockIn = useCallback(async () => {
    const result = await attendanceService.clockIn()
    setToday(result)
    await refreshRecords()
    return result
  }, [refreshRecords])

  const clockOut = useCallback(async () => {
    const result = await attendanceService.clockOut()
    setToday(result)
    await refreshRecords()
    return result
  }, [refreshRecords])

  return { today, records, loading, error, reload, clockIn, clockOut }
}
