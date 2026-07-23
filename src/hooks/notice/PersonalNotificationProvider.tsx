import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { noticeService } from '../../services/notice/notice.service.ts'
import { PersonalNotificationSummaryContext } from './personal-notification-context.ts'

interface PersonalNotificationProviderProps {
  children: ReactNode
}

export function PersonalNotificationProvider({
  children,
}: PersonalNotificationProviderProps) {
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const refreshUnreadCount = useCallback(async () => {
    setLoading(true)
    try {
      setUnreadCount(await noticeService.getPersonalUnreadCount())
    } catch {
      // Header badges are auxiliary; the notification page reports request errors explicitly.
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true

    noticeService
      .getPersonalUnreadCount()
      .then((count) => {
        if (active) {
          setUnreadCount(count)
        }
      })
      .catch(() => {
        // Header badges are auxiliary; the notification page reports request errors explicitly.
      })
      .finally(() => {
        if (active) {
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [])

  const value = useMemo(
    () => ({ unreadCount, loading, refreshUnreadCount }),
    [loading, refreshUnreadCount, unreadCount],
  )

  return (
    <PersonalNotificationSummaryContext.Provider value={value}>
      {children}
    </PersonalNotificationSummaryContext.Provider>
  )
}
