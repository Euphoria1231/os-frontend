import client from '../client';
import type { ApiResponse, PageResponse } from '../../types/common';
import type {
  Notice,
  NoticeDetail,
  Message,
  UnreadCount,
  ReadAllResult,
} from '../../types/notice';

/** 查询公告列表 */
export function getNotices(
  pageNum: number,
  pageSize: number,
  category?: string,
): Promise<ApiResponse<PageResponse<Notice>>> {
  return client.get('/notices', { params: { pageNum, pageSize, category } });
}

/** 获取公告详情 */
export function getNoticeDetail(id: number): Promise<ApiResponse<NoticeDetail>> {
  return client.get(`/notices/${id}`);
}

/** 标记公告已读 */
export function markNoticeRead(id: number): Promise<ApiResponse<{ id: number; isRead: boolean }>> {
  return client.put(`/notices/${id}/read`);
}

/** 获取未读数量 */
export function getUnreadCount(): Promise<ApiResponse<UnreadCount>> {
  return client.get('/notices/unread-count');
}

/** 查询站内消息列表 */
export function getMessages(
  pageNum: number,
  pageSize: number,
): Promise<ApiResponse<PageResponse<Message>>> {
  return client.get('/notices/messages', { params: { pageNum, pageSize } });
}

/** 标记单条消息已读 */
export function markMessageRead(id: number): Promise<ApiResponse<{ id: number; isRead: boolean }>> {
  return client.put(`/notices/messages/${id}/read`);
}

/** 全部消息已读 */
export function markAllMessagesRead(): Promise<ApiResponse<ReadAllResult>> {
  return client.put('/notices/messages/read-all');
}
