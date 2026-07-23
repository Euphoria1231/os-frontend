import { useContext } from 'react'
import { PersonalNotificationSummaryContext } from './personal-notification-context.ts'

export function usePersonalNotificationSummary() {
  const context = useContext(PersonalNotificationSummaryContext)

  if (!context) {
    throw new Error(
      'usePersonalNotificationSummary must be used inside PersonalNotificationProvider',
    )
  }

  return context
}
