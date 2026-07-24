import { useMemo } from 'react'
import { useAuth } from '../auth/useAuth.ts'
import { useApplications } from '../flow/useApplications.ts'
import { useApprovalTasks } from '../flow/useApprovalTasks.ts'
import { useNotices } from '../notice/useNotices.ts'
import type { Notice } from '../../services/notice/notice.types.ts'
import {
  buildWorkbenchTasks,
  type WorkbenchTask,
} from '../../views/workbench/WorkbenchPage.logic.ts'

export interface WorkspaceUtilityData {
  tasks: WorkbenchTask[]
  taskLoading: boolean
  taskError: unknown
  notices: Notice[]
  unreadCount: number
  noticeLoading: boolean
  noticeError: unknown
}

export function useWorkspaceUtilityData(): WorkspaceUtilityData {
  const { isSuperAdmin, hasAuthority } = useAuth()
  const { applications, loading: applicationLoading, error: applicationError } =
    useApplications(!isSuperAdmin)
  const canViewApprovalTasks = hasAuthority('GET:/api/flow/tasks/**')
  const {
    todo: approvalApplications,
    loading: approvalLoading,
    error: approvalError,
  } = useApprovalTasks(canViewApprovalTasks)
  const {
    notices,
    unreadCount,
    loading: noticeLoading,
    error: noticeError,
  } = useNotices()
  const tasks = useMemo(
    () => buildWorkbenchTasks(applications, approvalApplications),
    [applications, approvalApplications],
  )

  return {
    tasks,
    taskLoading: applicationLoading || approvalLoading,
    taskError: applicationError ?? approvalError,
    notices,
    unreadCount,
    noticeLoading,
    noticeError,
  }
}
