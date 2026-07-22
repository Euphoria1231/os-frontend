import { describe, it, expect, beforeEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import { client } from '../api/client';
import * as flowApi from '../api/flow';

describe('审批 API', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(client);
    localStorage.setItem('oa_token', 'mock-jwt-token-admin-2026');
  });

  it('提交请假申请成功', async () => {
    const { flowMock } = await import('../mock/flow');
    flowMock(mock);

    const res = await flowApi.applyLeave({
      type: 'annual_leave',
      startDate: '2026-08-01',
      endDate: '2026-08-02',
      reason: '家中有事',
    });
    expect(res.code).toBe(200);
    expect(res.data.type).toBe('annual_leave');
    expect(res.data.status).toBe('pending');
    expect(res.data.days).toBe(2);
  });

  it('结束日期早于开始日期返回业务错误', async () => {
    const { flowMock } = await import('../mock/flow');
    flowMock(mock);

    await expect(
      flowApi.applyLeave({
        type: 'annual_leave',
        startDate: '2026-08-03',
        endDate: '2026-08-01',
        reason: '测试',
      }),
    ).rejects.toThrow('结束日期不能早于开始日期');
  });

  it('提交加班申请成功', async () => {
    const { flowMock } = await import('../mock/flow');
    flowMock(mock);

    const res = await flowApi.applyOvertime({
      date: '2026-07-22',
      startTime: '18:00',
      endTime: '21:00',
      hours: 3,
      reason: '项目紧急',
    });
    expect(res.code).toBe(200);
    expect(res.data.hours).toBe(3);
    expect(res.data.status).toBe('pending');
  });

  it('查询待办任务列表', async () => {
    const { flowMock } = await import('../mock/flow');
    flowMock(mock);

    const res = await flowApi.getTodoTasks(1, 10);
    expect(res.code).toBe(200);
    expect(res.data.list.length).toBeGreaterThan(0);
    expect(res.data.list[0].status).toBe('pending');
  });

  it('查询已办任务列表', async () => {
    const { flowMock } = await import('../mock/flow');
    flowMock(mock);

    const res = await flowApi.getDoneTasks(1, 10);
    expect(res.code).toBe(200);
    expect(res.data.list.length).toBeGreaterThan(0);
  });

  it('同意审批任务后从待办列表移除', async () => {
    const { flowMock } = await import('../mock/flow');
    flowMock(mock);

    const res = await flowApi.approveTask(201);
    expect(res.code).toBe(200);
    expect(res.data.status).toBe('approved');

    const todoRes = await flowApi.getTodoTasks(1, 10);
    expect(todoRes.data.list.find((t) => t.id === 201)).toBeUndefined();
  });

  it('驳回审批任务必须填写意见', async () => {
    const { flowMock } = await import('../mock/flow');
    flowMock(mock);

    await expect(flowApi.rejectTask(201, { comment: '' })).rejects.toThrow('驳回必须填写意见');
  });

  it('驳回审批任务成功后从待办列表移除', async () => {
    const { flowMock } = await import('../mock/flow');
    flowMock(mock);

    // 使用 task 202，因为 201 可能已被前一个测试消耗
    const res = await flowApi.rejectTask(202, { comment: '不予批准' });
    expect(res.code).toBe(200);
    expect(res.data.status).toBe('rejected');

    const todoRes = await flowApi.getTodoTasks(1, 10);
    expect(todoRes.data.list.find((t) => t.id === 202)).toBeUndefined();
  });

  it('查询审批历史', async () => {
    const { flowMock } = await import('../mock/flow');
    flowMock(mock);

    const res = await flowApi.getApprovalHistory(1);
    expect(res.code).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);
    expect(res.data.length).toBeGreaterThan(0);
  });
});
