import { useCallback, useEffect, useState } from 'react'
import { noticeService } from '../../services/notice/notice.service.ts'
import type { Notice, NoticePublishRequest } from '../../services/notice/notice.types.ts'

export function useNotices() {
  const [notices, setNotices] = useState<Notice[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown>(null)

  useEffect(() => {
    let active = true

    Promise.all([noticeService.listNotices(), noticeService.getUnreadCount()])
      .then(([noticeList, count]) => {
        if (active) {
          setNotices(noticeList)
          setUnreadCount(count)
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

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [noticeList, count] = await Promise.all([
        noticeService.listNotices(),
        noticeService.getUnreadCount(),
      ])
      setNotices(noticeList)
      setUnreadCount(count)
    } catch (requestError) {
      setError(requestError)
    } finally {
      setLoading(false)
    }
  }, [])

  const publishNotice = useCallback(
    async (values: NoticePublishRequest) => {
      const result = await noticeService.publishNotice(values)
      await reload()
      return result
    },
    [reload],
  )

  const readNotice = useCallback(async (id: number, markAsRead = true) => {
    let detail = await noticeService.getNotice(id)
    if (!detail.read && markAsRead) {
      await noticeService.markRead(id)
      const [updatedDetail, count] = await Promise.all([
        noticeService.getNotice(id),
        noticeService.getUnreadCount(),
      ])
      detail = updatedDetail
      setUnreadCount(count)
      setNotices((current) =>
        current.map((notice) => (notice.id === id ? updatedDetail : notice)),
      )
    }
    return detail
  }, [])

  return { notices, unreadCount, loading, error, reload, publishNotice, readNotice }
}
