import type {
  ApplicationStatus,
  ApplicationType,
} from '../flow/flow.types.ts'

export type SearchCategory = 'all' | 'notice' | 'application'

export interface SearchPage<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export interface NoticeSearchItem {
  noticeId: number
  title: string
  content: string
  titleHighlight: string | null
  contentHighlight: string | null
  publishedAt: string
}

export interface ApplicationSearchItem {
  applicationId: number
  applicantId: number
  type: ApplicationType
  status: ApplicationStatus
  reasonSummary: string
  reasonHighlight: string | null
  submittedAt: string
  updatedAt: string
}

export type GlobalSearchResult =
  | {
      key: string
      kind: 'notice'
      item: NoticeSearchItem
    }
  | {
      key: string
      kind: 'application'
      item: ApplicationSearchItem
    }
