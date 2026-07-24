import { createElement, type ReactElement } from 'react'

interface CalendarTaskIndicatorProps {
  hasTask: boolean
}

const FULL_WIDTH_WORKSPACE_PATHS = new Set([
  '/workspace',
  '/ai/assistant',
])

export function shouldShowWorkspaceUtilityRail(pathname: string): boolean {
  return !FULL_WIDTH_WORKSPACE_PATHS.has(pathname)
}

export function CalendarTaskIndicator({
  hasTask,
}: CalendarTaskIndicatorProps): ReactElement | null {
  return hasTask
    ? createElement('i', { className: 'workspace-calendar-task-dot' })
    : null
}
