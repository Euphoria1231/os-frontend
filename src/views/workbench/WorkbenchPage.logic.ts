import type { FlowApplication } from '../../services/flow/flow.types.ts'

export type WorkbenchTaskCategory = 'MY_APPLICATION' | 'APPROVAL'

export interface WorkbenchTask {
  key: string
  category: WorkbenchTaskCategory
  title: string
  statusLabel: string
  applicationNo: string
  reason: string
  dateKey: string
  path: '/flow/applications' | '/flow/approvals'
}

function getApplicationDateKey(application: FlowApplication): string {
  return (application.startTime ?? application.createdAt).slice(0, 10)
}

function getApplicationLabel(application: FlowApplication): string {
  return application.applicationType === 'LEAVE' ? '请假' : '加班'
}

export function buildWorkbenchTasks(
  applications: FlowApplication[],
  approvalApplications: FlowApplication[],
): WorkbenchTask[] {
  const ownTasks = applications
    .filter(
      (application) =>
        application.status === 'PENDING' && application.applicationType !== 'MAKEUP',
    )
    .map<WorkbenchTask>((application) => ({
      key: `mine-${application.id}`,
      category: 'MY_APPLICATION',
      title: `${getApplicationLabel(application)}申请`,
      statusLabel: '等待审批',
      applicationNo: application.applicationNo,
      reason: application.reason,
      dateKey: getApplicationDateKey(application),
      path: '/flow/applications',
    }))

  const approvalTasks = approvalApplications
    .filter(
      (application) =>
        application.status === 'PENDING' && application.applicationType !== 'MAKEUP',
    )
    .map<WorkbenchTask>((application) => ({
      key: `approval-${application.id}`,
      category: 'APPROVAL',
      title: `${getApplicationLabel(application)}审批`,
      statusLabel: '待处理',
      applicationNo: application.applicationNo,
      reason: application.reason,
      dateKey: getApplicationDateKey(application),
      path: '/flow/approvals',
    }))

  return [...ownTasks, ...approvalTasks].sort((left, right) =>
    left.dateKey.localeCompare(right.dateKey),
  )
}

export function getTasksForDate(
  tasks: WorkbenchTask[],
  dateKey: string,
): WorkbenchTask[] {
  return tasks.filter((task) => task.dateKey === dateKey)
}
