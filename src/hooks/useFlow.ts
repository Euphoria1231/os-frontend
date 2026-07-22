import { useState, useCallback, useEffect } from 'react';
import * as flowApi from '../api/flow';
import type {
  LeaveApplication,
  OvertimeApplication,
  FlowTask,
  DoneTask,
  LeaveApplyRequest,
  OvertimeApplyRequest,
  ApprovalHistoryStep,
} from '../types/flow';
import type { PageResponse } from '../types/common';

type AnyApplication = LeaveApplication | OvertimeApplication;

export function useMyApplications() {
  const [applications, setApplications] = useState<AnyApplication[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await flowApi.getMyApplications(pageNum, pageSize);
      const page = res.data as PageResponse<AnyApplication>;
      setApplications(page.list);
      setTotal(page.total);
    } catch {
      setApplications([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [pageNum, pageSize]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  return {
    applications,
    total,
    loading,
    pageNum,
    pageSize,
    setPageNum,
    setPageSize,
    fetchApplications,
  };
}

export function useLeaveApply() {
  const [submitting, setSubmitting] = useState(false);

  const submit = useCallback(async (req: LeaveApplyRequest): Promise<boolean> => {
    if (submitting) return false;
    setSubmitting(true);
    try {
      await flowApi.applyLeave(req);
      return true;
    } catch {
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [submitting]);

  return { submitting, submit };
}

export function useOvertimeApply() {
  const [submitting, setSubmitting] = useState(false);

  const submit = useCallback(async (req: OvertimeApplyRequest): Promise<boolean> => {
    if (submitting) return false;
    setSubmitting(true);
    try {
      await flowApi.applyOvertime(req);
      return true;
    } catch {
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [submitting]);

  return { submitting, submit };
}

export function useTodoTasks() {
  const [tasks, setTasks] = useState<FlowTask[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [approving, setApproving] = useState<number | null>(null);
  const [rejecting, setRejecting] = useState<number | null>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await flowApi.getTodoTasks(pageNum, pageSize);
      const page = res.data as PageResponse<FlowTask>;
      setTasks(page.list);
      setTotal(page.total);
    } catch {
      setTasks([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [pageNum, pageSize]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const approve = useCallback(async (taskId: number): Promise<boolean> => {
    if (approving !== null) return false;
    setApproving(taskId);
    try {
      await flowApi.approveTask(taskId);
      await fetchTasks();
      return true;
    } catch {
      return false;
    } finally {
      setApproving(null);
    }
  }, [approving, fetchTasks]);

  const reject = useCallback(async (taskId: number, comment: string): Promise<boolean> => {
    if (rejecting !== null) return false;
    setRejecting(taskId);
    try {
      await flowApi.rejectTask(taskId, { comment });
      await fetchTasks();
      return true;
    } catch {
      return false;
    } finally {
      setRejecting(null);
    }
  }, [rejecting, fetchTasks]);

  return {
    tasks,
    total,
    loading,
    pageNum,
    pageSize,
    approving,
    rejecting,
    setPageNum,
    setPageSize,
    fetchTasks,
    approve,
    reject,
  };
}

export function useDoneTasks() {
  const [tasks, setTasks] = useState<DoneTask[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await flowApi.getDoneTasks(pageNum, pageSize);
      const page = res.data as PageResponse<DoneTask>;
      setTasks(page.list);
      setTotal(page.total);
    } catch {
      setTasks([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [pageNum, pageSize]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    total,
    loading,
    pageNum,
    pageSize,
    setPageNum,
    setPageSize,
    fetchTasks,
  };
}

export function useApprovalHistory(applicationId: number | null) {
  const [history, setHistory] = useState<ApprovalHistoryStep[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = useCallback(async () => {
    if (!applicationId) {
      setHistory([]);
      return;
    }
    setLoading(true);
    try {
      const res = await flowApi.getApprovalHistory(applicationId);
      setHistory(res.data);
    } catch {
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return { history, loading, fetchHistory };
}
