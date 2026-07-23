import { http } from '../request.ts'
import type {
  Notice,
  NoticePublishRequest,
  PersonalNotificationPage,
} from './notice.types.ts'

const NOTICE_PATH = '/api/notices'

export const noticeService = {
  listNotices: () => http.get<Notice[]>(NOTICE_PATH),
  getNotice: (id: number) => http.get<Notice>(`${NOTICE_PATH}/${id}`),
  publishNotice: (values: NoticePublishRequest) =>
    http.post<Notice, NoticePublishRequest>(NOTICE_PATH, values),
  markRead: (id: number) => http.put<void>(`${NOTICE_PATH}/${id}/read`),
  getUnreadCount: () => http.get<number>(`${NOTICE_PATH}/unread-count`),
  listPersonalNotifications: (page: number, pageSize: number) =>
    http.get<PersonalNotificationPage>(`${NOTICE_PATH}/personal`, {
      params: { page, pageSize },
    }),
  getPersonalUnreadCount: () => http.get<number>(`${NOTICE_PATH}/personal/unread-count`),
  markPersonalNotificationRead: (id: number) =>
    http.put<void>(`${NOTICE_PATH}/personal/${id}/read`),
  markAllPersonalNotificationsRead: () =>
    http.put<void>(`${NOTICE_PATH}/personal/read-all`),
}
