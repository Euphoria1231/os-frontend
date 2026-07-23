export type NoticeStatus = 'PUBLISHED'

export interface Notice {
  id: number
  title: string
  content: string
  publisherId: number
  status: NoticeStatus
  publishedAt: string
  read: boolean
  readAt: string | null
}

export interface NoticePublishRequest {
  title: string
  content: string
}

export type PersonalNotificationType =
  | 'APPROVAL_TASK'
  | 'APPLICATION_REJECTED'
  | 'APPLICATION_APPROVED'
  | 'ATTENDANCE_ABNORMAL'

export type RelatedBusinessType = 'FLOW_APPLICATION' | 'ATTENDANCE_RECORD'

export interface PersonalNotification {
  id: number
  eventId: string
  notificationType: PersonalNotificationType
  title: string
  content: string
  relatedBusinessType: RelatedBusinessType
  relatedBusinessId: number
  read: boolean
  readAt: string | null
  createdAt: string
}

export interface PersonalNotificationPage {
  items: PersonalNotification[]
  total: number
  page: number
  pageSize: number
}
