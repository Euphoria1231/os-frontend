import { useState, useCallback, useEffect } from 'react';
import * as noticeApi from '../api/notice';
import type { Notice, NoticeDetail, Message, UnreadCount } from '../../types/notice';
import type { PageResponse } from '../../types/common';

export function useNoticeList() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [category, setCategory] = useState<string | undefined>();

  const fetchNotices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await noticeApi.getNotices(pageNum, pageSize, category);
      const page = res.data as PageResponse<Notice>;
      setNotices(page.list);
      setTotal(page.total);
    } catch {
      setNotices([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [pageNum, pageSize, category]);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  return {
    notices,
    total,
    loading,
    pageNum,
    pageSize,
    category,
    setPageNum,
    setPageSize,
    setCategory,
    fetchNotices,
  };
}

export function useNoticeDetail(id: number | null) {
  const [detail, setDetail] = useState<NoticeDetail | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchDetail = useCallback(async () => {
    if (!id) {
      setDetail(null);
      return;
    }
    setLoading(true);
    try {
      const res = await noticeApi.getNoticeDetail(id);
      setDetail(res.data);
      // 进入详情后调用已读接口，调用失败不假装已读
      try {
        await noticeApi.markNoticeRead(id);
      } catch {
        // 已读接口失败不影响详情展示
      }
    } catch {
      setDetail(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  return { detail, loading, fetchDetail };
}

export function useMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await noticeApi.getMessages(pageNum, pageSize);
      const page = res.data as PageResponse<Message>;
      setMessages(page.list);
      setTotal(page.total);
    } catch {
      setMessages([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [pageNum, pageSize]);

  const markRead = useCallback(async (messageId: number) => {
    try {
      await noticeApi.markMessageRead(messageId);
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, isRead: true } : m)),
      );
      return true;
    } catch {
      return false;
    }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await noticeApi.markAllMessagesRead();
      setMessages((prev) => prev.map((m) => ({ ...m, isRead: true })));
      return true;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  return {
    messages,
    total,
    loading,
    pageNum,
    pageSize,
    setPageNum,
    setPageSize,
    fetchMessages,
    markRead,
    markAllRead,
  };
}

export function useUnreadCount() {
  const [unreadCount, setUnreadCount] = useState<UnreadCount | null>(null);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await noticeApi.getUnreadCount();
      setUnreadCount(res.data);
    } catch {
      // 静默失败，不影响主页面
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  return { unreadCount, fetchUnreadCount };
}
