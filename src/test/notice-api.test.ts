import { describe, it, expect, beforeEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import { client } from '../api/client';
import * as noticeApi from '../api/notice';

describe('公告与消息 API', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(client);
    localStorage.setItem('oa_token', 'mock-jwt-token-admin-2026');
  });

  it('查询公告列表返回分页数据', async () => {
    const { noticeMock } = await import('../mock/notice');
    noticeMock(mock);

    const res = await noticeApi.getNotices(1, 10);
    expect(res.code).toBe(200);
    expect(res.data.list.length).toBeGreaterThan(0);
    expect(res.data.total).toBeGreaterThan(0);
  });

  it('按分类筛选公告', async () => {
    const { noticeMock } = await import('../mock/notice');
    noticeMock(mock);

    const res = await noticeApi.getNotices(1, 10, '行政通知');
    expect(res.code).toBe(200);
    res.data.list.forEach((n) => {
      expect(n.category).toBe('行政通知');
    });
  });

  it('获取公告详情', async () => {
    const { noticeMock } = await import('../mock/notice');
    noticeMock(mock);

    const res = await noticeApi.getNoticeDetail(1);
    expect(res.code).toBe(200);
    expect(res.data.id).toBe(1);
    expect(res.data.title).toBeTruthy();
    expect(res.data.content).toBeTruthy();
  });

  it('标记公告已读', async () => {
    const { noticeMock } = await import('../mock/notice');
    noticeMock(mock);

    const res = await noticeApi.markNoticeRead(1);
    expect(res.code).toBe(200);
    expect(res.data.isRead).toBe(true);
  });

  it('获取未读数量', async () => {
    const { noticeMock } = await import('../mock/notice');
    noticeMock(mock);

    const res = await noticeApi.getUnreadCount();
    expect(res.code).toBe(200);
    expect(res.data.total).toBeGreaterThanOrEqual(0);
    expect(res.data.notices).toBeGreaterThanOrEqual(0);
    expect(res.data.messages).toBeGreaterThanOrEqual(0);
  });

  it('查询站内消息列表', async () => {
    const { noticeMock } = await import('../mock/notice');
    noticeMock(mock);

    const res = await noticeApi.getMessages(1, 10);
    expect(res.code).toBe(200);
    expect(res.data.list.length).toBeGreaterThan(0);
  });

  it('标记单条消息已读', async () => {
    const { noticeMock } = await import('../mock/notice');
    noticeMock(mock);

    const res = await noticeApi.markMessageRead(1);
    expect(res.code).toBe(200);
    expect(res.data.isRead).toBe(true);
  });

  it('全部消息已读', async () => {
    const { noticeMock } = await import('../mock/notice');
    noticeMock(mock);

    const res = await noticeApi.markAllMessagesRead();
    expect(res.code).toBe(200);
    expect(res.data.count).toBeGreaterThan(0);
  });
});
