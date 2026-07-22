import { describe, it, expect, beforeEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import { client } from '../api/client';
import * as attendanceApi from '../api/attendance';
import { resetAttendanceMock } from '../mock/attendance';

describe('考勤 API', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(client);
    resetAttendanceMock();
    localStorage.setItem('oa_token', 'mock-jwt-token-admin-2026');
  });

  it('上班打卡成功返回打卡结果', async () => {
    const { attendanceMock } = await import('../mock/attendance');
    attendanceMock(mock);

    const res = await attendanceApi.clockIn();
    expect(res.code).toBe(200);
    expect(res.data.clockInTime).toBeTruthy();
    expect(res.data.date).toBe(new Date().toISOString().slice(0, 10));
  });

  it('重复上班打卡返回业务错误', async () => {
    const { attendanceMock } = await import('../mock/attendance');
    attendanceMock(mock);

    await attendanceApi.clockIn();
    await expect(attendanceApi.clockIn()).rejects.toThrow('今日已打卡上班');
  });

  it('未上班打卡时下班打卡返回错误', async () => {
    const { attendanceMock } = await import('../mock/attendance');
    attendanceMock(mock);

    await expect(attendanceApi.clockOut()).rejects.toThrow('今日尚未打卡上班');
  });

  it('获取今日状态返回未打卡状态', async () => {
    const { attendanceMock } = await import('../mock/attendance');
    attendanceMock(mock);

    const res = await attendanceApi.getTodayStatus();
    expect(res.code).toBe(200);
    expect(res.data.status).toBe('not_clocked');
    expect(res.data.clockInTime).toBeNull();
  });

  it('查询考勤记录返回分页数据', async () => {
    const { attendanceMock } = await import('../mock/attendance');
    attendanceMock(mock);

    const res = await attendanceApi.getRecords({ pageNum: 1, pageSize: 5 });
    expect(res.code).toBe(200);
    expect(res.data.list.length).toBeLessThanOrEqual(5);
    expect(res.data.total).toBeGreaterThan(0);
    expect(res.data.pageNum).toBe(1);
  });

  it('按日期范围筛选考勤记录', async () => {
    const { attendanceMock } = await import('../mock/attendance');
    attendanceMock(mock);

    const today = new Date().toISOString().slice(0, 10);
    const res = await attendanceApi.getRecords({
      pageNum: 1,
      pageSize: 10,
      startDate: today,
      endDate: today,
    });
    expect(res.code).toBe(200);
    res.data.list.forEach((r) => {
      expect(r.date).toBe(today);
    });
  });

  it('获取个人考勤统计', async () => {
    const { attendanceMock } = await import('../mock/attendance');
    attendanceMock(mock);

    const res = await attendanceApi.getStatistics();
    expect(res.code).toBe(200);
    expect(res.data.totalDays).toBeGreaterThan(0);
    expect(res.data.trend.length).toBeGreaterThan(0);
  });

  it('获取部门考勤统计', async () => {
    const { attendanceMock } = await import('../mock/attendance');
    attendanceMock(mock);

    const res = await attendanceApi.getDepartmentStatistics();
    expect(res.code).toBe(200);
    expect(res.data.departmentName).toBeTruthy();
    expect(res.data.totalEmployees).toBeGreaterThan(0);
  });
});
