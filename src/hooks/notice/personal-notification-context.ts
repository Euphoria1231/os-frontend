import { createContext } from 'react'

export interface PersonalNotificationSummaryContextValue {
  unreadCount: number
  loading: boolean
  refreshUnreadCount: () => Promise<void>
}

export const PersonalNotificationSummaryContext =
  createContext<PersonalNotificationSummaryContextValue | null>(null)
