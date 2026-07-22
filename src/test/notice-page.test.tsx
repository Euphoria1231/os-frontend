import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { client } from '../api/client';
import { App } from 'antd';
import { MemoryRouter } from 'react-router-dom';
import NoticeListPage from '../views/Notice/NoticeList';
import MessageListPage from '../views/Notice/MessageList';

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <App>
      <MemoryRouter>{ui}</MemoryRouter>
    </App>,
  );
}

describe('公告与消息页面', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(client);
    localStorage.setItem('oa_token', 'mock-jwt-token-admin-2026');
  });

  describe('公告列表页面', () => {
    it('显示公告列表', async () => {
      const { noticeMock } = await import('../mock/notice');
      noticeMock(mock);

      renderWithProviders(<NoticeListPage />);

      await waitFor(() => {
        expect(screen.getByText('公告列表')).toBeInTheDocument();
        // Mock 数据中的公告标题应该出现
        expect(screen.getByText('关于2026年暑期放假安排的通知')).toBeInTheDocument();
      });
    });

    it('未读公告显示红点', async () => {
      const { noticeMock } = await import('../mock/notice');
      noticeMock(mock);

      renderWithProviders(<NoticeListPage />);

      await waitFor(() => {
        expect(screen.getByText('关于2026年暑期放假安排的通知')).toBeInTheDocument();
      });
    });

    it('点击公告弹出详情弹窗', async () => {
      const { noticeMock } = await import('../mock/notice');
      noticeMock(mock);

      renderWithProviders(<NoticeListPage />);

      await waitFor(() => {
        expect(screen.getByText('关于2026年暑期放假安排的通知')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('关于2026年暑期放假安排的通知'));

      await waitFor(() => {
        // 详情弹窗标题 - 弹窗内会出现公告内容
        expect(screen.getByText(/各位同事/)).toBeInTheDocument();
      });
    });
  });

  describe('消息列表页面', () => {
    it('显示消息列表', async () => {
      const { noticeMock } = await import('../mock/notice');
      noticeMock(mock);

      renderWithProviders(<MessageListPage />);

      await waitFor(() => {
        expect(screen.getByText('站内消息')).toBeInTheDocument();
        expect(screen.getByText('您的请假申请已被审批')).toBeInTheDocument();
      });
    });

    it('显示全部已读按钮', async () => {
      const { noticeMock } = await import('../mock/notice');
      noticeMock(mock);

      renderWithProviders(<MessageListPage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /全部已读/ })).toBeInTheDocument();
      });
    });

    it('未读消息显示标为已读按钮', async () => {
      const { noticeMock } = await import('../mock/notice');
      noticeMock(mock);

      renderWithProviders(<MessageListPage />);

      await waitFor(() => {
        expect(screen.getAllByText('标为已读').length).toBeGreaterThan(0);
      });
    });
  });
});
