import client from '../client';
import type { ApiResponse, PageResponse } from '../../types/common';
import type {
  LeaveApplication,
  OvertimeApplication,
  LeaveApplyRequest,
  OvertimeApplyRequest,
  FlowTask,
  DoneTask,
  ApproveRequest,
  RejectRequest,
  ApprovalHistoryStep,
} from '../../types/flow';

/** 提交请假申请 */
export function applyLeave(req: LeaveApplyRequest): Promise<ApiResponse<LeaveApplication>> {
  return client.post('/flow/applications/leave', req);
}

/** 提交加班申请 */
export function applyOvertime(req: OvertimeApplyRequest): Promise<ApiResponse<OvertimeApplication>> {
  return client.post('/flow/applications/overtime', req);
}

/** 查询本人申请列表 */
export function getMyApplications(
  pageNum: number,
  pageSize: number,
): Promise<ApiResponse<PageResponse<LeaveApplication | OvertimeApplication>>> {
  return client.get('/flow/applications/mine', { params: { pageNum, pageSize } });
}

/** 查询待办任务 */
export function getTodoTasks(
  pageNum: number,
  pageSize: number,
): Promise<ApiResponse<PageResponse<FlowTask>>> {
  return client.get('/flow/tasks/todo', { params: { pageNum, pageSize } });
}

/** 查询已办任务 */
export function getDoneTasks(
  pageNum: number,
  pageSize: number,
): Promise<ApiResponse<PageResponse<DoneTask>>> {
  return client.get('/flow/tasks/done', { params: { pageNum, pageSize } });
}

/** 同意审批任务 */
export function approveTask(taskId: number, req?: ApproveRequest): Promise<ApiResponse<{ id: number; status: string }>> {
  return client.post(`/flow/tasks/${taskId}/approve`, req || {});
}

/** 驳回审批任务 */
export function rejectTask(taskId: number, req: RejectRequest): Promise<ApiResponse<{ id: number; status: string }>> {
  return client.post(`/flow/tasks/${taskId}/reject`, req);
}

/** 查询审批历史 */
export function getApprovalHistory(applicationId: number): Promise<ApiResponse<ApprovalHistoryStep[]>> {
  return client.get(`/flow/applications/${applicationId}/history`);
}

/** 撤回申请 */
export function withdrawTask(taskId: number): Promise<ApiResponse<{ id: number; status: string }>> {
  return client.post(`/flow/tasks/${taskId}/withdraw`);
}

/** 转办任务 */
export function transferTask(taskId: number, targetUserId: number): Promise<ApiResponse<{ id: number; status: string }>> {
  return client.post(`/flow/tasks/${taskId}/transfer`, { targetUserId });
}
