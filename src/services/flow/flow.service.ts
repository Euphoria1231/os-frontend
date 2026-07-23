import { http } from '../request.ts'
import type {
  ApplicationRequest,
  ApprovalRequest,
  ApprovalTask,
  FlowApplication,
  MakeupApplicationRequest,
} from './flow.types.ts'

const APPLICATION_PATH = '/api/flow/applications'
const TASK_PATH = '/api/flow/tasks'

export const flowService = {
  listMyApplications: () => http.get<FlowApplication[]>(`${APPLICATION_PATH}/mine`),
  getApplication: (applicationId: number) =>
    http.get<FlowApplication>(`${APPLICATION_PATH}/${applicationId}`),
  submitLeave: (values: ApplicationRequest) =>
    http.post<FlowApplication, ApplicationRequest>(`${APPLICATION_PATH}/leave`, values),
  submitOvertime: (values: ApplicationRequest) =>
    http.post<FlowApplication, ApplicationRequest>(`${APPLICATION_PATH}/overtime`, values),
  submitMakeup: (values: MakeupApplicationRequest) =>
    http.post<FlowApplication, MakeupApplicationRequest>(`${APPLICATION_PATH}/makeup`, values),
  listTodo: () => http.get<FlowApplication[]>(`${TASK_PATH}/todo`),
  listDone: () => http.get<ApprovalTask[]>(`${TASK_PATH}/done`),
  approve: (applicationId: number, values: ApprovalRequest) =>
    http.post<FlowApplication, ApprovalRequest>(`${TASK_PATH}/${applicationId}/approve`, values),
  reject: (applicationId: number, values: ApprovalRequest) =>
    http.post<FlowApplication, ApprovalRequest>(`${TASK_PATH}/${applicationId}/reject`, values),
}
