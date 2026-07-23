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
