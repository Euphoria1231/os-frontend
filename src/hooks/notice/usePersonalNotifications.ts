import { useCallback, useEffect, useState } from 'react'
import { noticeService } from '../../services/notice/notice.service.ts'
import type { PersonalNotificationPage } from '../../services/notice/notice.types.ts'
import { usePersonalNotificationSummary } from './usePersonalNotificationSummary.ts'

const PAGE_SIZE = 12
const EMPTY_PAGE: PersonalNotificationPage = {
  items: [],
  total: 0,
  page: 1,
  pageSize: PAGE_SIZE,
}

export function usePersonalNotifications() {
  const [pageData, setPageData] = useState<PersonalNotificationPage>(EMPTY_PAGE)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown>(null)
  const { refreshUnreadCount } = usePersonalNotificationSummary()

  const loadPage = useCallback(async (page: number) => {
    setLoading(true)
    setError(null)
    try {
      setPageData(await noticeService.listPersonalNotifications(page, PAGE_SIZE))
    } catch (requestError) {
      setError(requestError)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true

    noticeService
      .listPersonalNotifications(1, PAGE_SIZE)
      .then((result) => {
        if (active) {
          setPageData(result)
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
  }, [])

  const markRead = useCallback(
    async (id: number) => {
      await noticeService.markPersonalNotificationRead(id)
      await Promise.all([
        loadPage(pageData.page),
        refreshUnreadCount(),
      ])
    },
    [loadPage, pageData.page, refreshUnreadCount],
  )

  const markAllRead = useCallback(async () => {
    await noticeService.markAllPersonalNotificationsRead()
    await Promise.all([
      loadPage(pageData.page),
      refreshUnreadCount(),
    ])
  }, [loadPage, pageData.page, refreshUnreadCount])

  return {
    pageData,
    loading,
    error,
    loadPage,
    markRead,
    markAllRead,
  }
}
