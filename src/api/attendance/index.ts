import client from '../client';
import type { ApiResponse, PageResponse } from '../../types/common';
import type {
  TodayStatus,
  ClockResult,
  AttendanceRecord,
  AttendanceQuery,
  AttendanceStatistics,
  DepartmentStatistics,
} from '../../types/attendance';

/** 上班打卡 */
export function clockIn(): Promise<ApiResponse<ClockResult>> {
  return client.post('/attendance/clock-in');
}

/** 下班打卡 */
export function clockOut(): Promise<ApiResponse<ClockResult>> {
  return client.post('/attendance/clock-out');
}

/** 获取今日考勤状态 */
export function getTodayStatus(): Promise<ApiResponse<TodayStatus>> {
  return client.get('/attendance/today');
}

/** 查询个人考勤记录 */
export function getRecords(query: AttendanceQuery): Promise<ApiResponse<PageResponse<AttendanceRecord>>> {
  return client.get('/attendance/records', { params: query });
}

/** 获取个人考勤统计 */
export function getStatistics(): Promise<ApiResponse<AttendanceStatistics>> {
  return client.get('/attendance/statistics');
}

/** 获取部门考勤统计 */
export function getDepartmentStatistics(): Promise<ApiResponse<DepartmentStatistics>> {
  return client.get('/attendance/statistics/department');
}

/** 下载月度考勤报表 */
export function downloadReport(month?: string): Promise<Blob> {
  return client.get('/attendance/reports/download', {
    params: month ? { month } : undefined,
    responseType: 'blob',
  });
}
