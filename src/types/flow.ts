/** 申请状态 */
export type ApplicationStatus = 'pending' | 'approved' | 'rejected' | 'withdrawn';

/** 请假类型 */
export type LeaveType =
  | 'annual_leave'   // 年假
  | 'sick_leave'     // 病假
  | 'personal_leave' // 事假
  | 'marriage_leave' // 婚假
  | 'maternity_leave'; // 产假

/** 请假申请 */
export interface LeaveApplication {
  id: number;
  applicantId: number;
  applicantName: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: ApplicationStatus;
  createdAt: string;
  currentTaskId: number | null;
}

/** 请假申请请求 */
export interface LeaveApplyRequest {
  type: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
}

/** 加班申请 */
export interface OvertimeApplication {
  id: number;
  applicantId: number;
  applicantName: string;
  date: string;
  startTime: string;
  endTime: string;
  hours: number;
  reason: string;
  status: ApplicationStatus;
  createdAt: string;
  currentTaskId: number | null;
}

/** 加班申请请求 */
export interface OvertimeApplyRequest {
  date: string;
  startTime: string;
  endTime: string;
  hours: number;
  reason: string;
}

/** 所有申请的联合类型 */
export type AnyApplication = LeaveApplication | OvertimeApplication;

/** 审批任务类型 */
export type TaskType = 'leave' | 'overtime';

/** 审批任务摘要 */
export interface FlowTask {
  id: number;
  applicationId: number;
  applicantName: string;
  applicantDept: string;
  type: TaskType;
  subtype: string;
  summary: string;
  status: ApplicationStatus;
  createdAt: string;
  detail: {
    startDate?: string;
    endDate?: string;
    days?: number;
    date?: string;
    startTime?: string;
    endTime?: string;
    hours?: number;
    reason: string;
  };
}

/** 已办任务（含审批结果） */
export interface DoneTask extends FlowTask {
  result: 'approved' | 'rejected';
  comment: string;
  processedAt: string;
}

/** 审批操作请求 */
export interface ApproveRequest {
  comment?: string;
}

/** 驳回操作请求 */
export interface RejectRequest {
  comment: string;
}

/** 审批历史步骤 */
export interface ApprovalHistoryStep {
  step: number;
  approverName: string;
  action: string;
  comment: string;
  time: string;
}
