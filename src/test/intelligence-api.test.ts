import { describe, it, expect, beforeEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import { client } from '../api/client';
import * as intelligenceApi from '../api/intelligence';

describe('智能服务 API', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(client);
    localStorage.setItem('oa_token', 'mock-jwt-token-admin-2026');
  });

  it('关键词搜索返回结果', async () => {
    const { intelligenceMock } = await import('../mock/intelligence');
    intelligenceMock(mock);

    const res = await intelligenceApi.search({
      keyword: '暑期',
      pageNum: 1,
      pageSize: 10,
    });
    expect(res.code).toBe(200);
    expect(res.data.total).toBeGreaterThan(0);
    expect(res.data.list[0].title).toContain('暑期');
  });

  it('空关键词返回空列表', async () => {
    const { intelligenceMock } = await import('../mock/intelligence');
    intelligenceMock(mock);

    const res = await intelligenceApi.search({
      keyword: '',
      pageNum: 1,
      pageSize: 10,
    });
    expect(res.code).toBe(200);
    expect(res.data.total).toBe(0);
    expect(res.data.list).toEqual([]);
  });

  it('按类型筛选搜索结果', async () => {
    const { intelligenceMock } = await import('../mock/intelligence');
    intelligenceMock(mock);

    const res = await intelligenceApi.search({
      keyword: '前端',
      pageNum: 1,
      pageSize: 10,
      type: 'notice',
    });
    expect(res.code).toBe(200);
    res.data.list.forEach((r) => {
      expect(r.type).toBe('notice');
    });
  });

  it('AI 问答返回成功响应', async () => {
    const { intelligenceMock } = await import('../mock/intelligence');
    intelligenceMock(mock);

    const res = await intelligenceApi.askAI('帮我分析一下本周的考勤情况');
    expect(res.code).toBe(200);
    expect(res.data.status).toBe('success');
    expect(res.data.answer).toBeTruthy();
  });

  it('AI 问答空问题返回业务错误', async () => {
    const { intelligenceMock } = await import('../mock/intelligence');
    intelligenceMock(mock);

    await expect(intelligenceApi.askAI('')).rejects.toThrow('问题不能为空');
  });

  it('AI 未知问题返回降级状态', async () => {
    const { intelligenceMock } = await import('../mock/intelligence');
    intelligenceMock(mock);

    const res = await intelligenceApi.askAI('今天天气怎么样');
    expect(res.code).toBe(200);
    expect(res.data.status).toBe('degraded');
  });

  it('考勤智能分析返回指标数据', async () => {
    const { intelligenceMock } = await import('../mock/intelligence');
    intelligenceMock(mock);

    const res = await intelligenceApi.getAttendanceAnalysis();
    expect(res.code).toBe(200);
    expect(res.data.metrics.attendanceRate).toBeGreaterThan(0);
    expect(res.data.risks).toBeDefined();
    expect(res.data.suggestions).toBeDefined();
  });

  it('大屏总览数据包含四个分区', async () => {
    const { intelligenceMock } = await import('../mock/intelligence');
    intelligenceMock(mock);

    const res = await intelligenceApi.getDashboardOverview();
    expect(res.code).toBe(200);
    expect(res.data.organization).toBeDefined();
    expect(res.data.attendance).toBeDefined();
    expect(res.data.flow).toBeDefined();
    expect(res.data.notice).toBeDefined();
    expect(res.data.organization.deptDistribution.length).toBeGreaterThan(0);
  });
});
