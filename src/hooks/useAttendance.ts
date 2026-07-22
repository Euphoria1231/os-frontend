import { useState, useCallback, useEffect } from 'react';
import * as attendanceApi from '../api/attendance';
import type { TodayStatus, AttendanceRecord, AttendanceStatistics } from '../types/attendance';
import type { PageResponse } from '../types/common';

export function useAttendance() {
  const [todayStatus, setTodayStatus] = useState<TodayStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [clockingIn, setClockingIn] = useState(false);
  const [clockingOut, setClockingOut] = useState(false);

  const fetchTodayStatus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await attendanceApi.getTodayStatus();
      setTodayStatus(res.data);
    } catch {
      // 错误由 Axios 拦截器统一处理
    } finally {
      setLoading(false);
    }
  }, []);

  const clockIn = useCallback(async () => {
    if (clockingIn) return null;
    setClockingIn(true);
    try {
      const res = await attendanceApi.clockIn();
      setTodayStatus({
        ...res.data,
        status: res.data.status as TodayStatus['status'],
      });
      return res.data;
    } catch {
      return null;
    } finally {
      setClockingIn(false);
    }
  }, [clockingIn]);

  const clockOut = useCallback(async () => {
    if (clockingOut) return null;
    setClockingOut(true);
    try {
      const res = await attendanceApi.clockOut();
      setTodayStatus({
        ...res.data,
        status: res.data.status as TodayStatus['status'],
      });
      return res.data;
    } catch {
      return null;
    } finally {
      setClockingOut(false);
    }
  }, [clockingOut]);

  useEffect(() => {
    fetchTodayStatus();
  }, [fetchTodayStatus]);

  return {
    todayStatus,
    loading,
    clockingIn,
    clockingOut,
    fetchTodayStatus,
    clockIn,
    clockOut,
  };
}

export function useAttendanceRecords() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [startDate, setStartDate] = useState<string | undefined>();
  const [endDate, setEndDate] = useState<string | undefined>();

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const res = await attendanceApi.getRecords({
        pageNum,
        pageSize,
        startDate,
        endDate,
      });
      const page = res.data as PageResponse<AttendanceRecord>;
      setRecords(page.list);
      setTotal(page.total);
    } catch {
      setRecords([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [pageNum, pageSize, startDate, endDate]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  return {
    records,
    total,
    loading,
    pageNum,
    pageSize,
    startDate,
    endDate,
    setPageNum,
    setPageSize,
    setStartDate,
    setEndDate,
    fetchRecords,
  };
}

export function useAttendanceStatistics() {
  const [statistics, setStatistics] = useState<AttendanceStatistics | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchStatistics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await attendanceApi.getStatistics();
      setStatistics(res.data);
    } catch {
      setStatistics(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  return { statistics, loading, fetchStatistics };
}
