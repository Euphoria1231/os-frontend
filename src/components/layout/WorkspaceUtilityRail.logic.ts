import { createElement, type ReactElement } from 'react'

interface CalendarTaskIndicatorProps {
  hasTask: boolean
}

export function CalendarTaskIndicator({
  hasTask,
}: CalendarTaskIndicatorProps): ReactElement | null {
  return hasTask
    ? createElement('i', { className: 'workspace-calendar-task-dot' })
    : null
}
