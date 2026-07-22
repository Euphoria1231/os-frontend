import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MockAdapter from 'axios-mock-adapter';
import { App } from 'antd';
import { client } from '../api/client';
import SearchPage from '../views/Search/SearchPage';

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <App>
      <MemoryRouter>{ui}</MemoryRouter>
    </App>,
  );
}

describe('全文检索页面', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(client);
    localStorage.setItem('oa_token', 'mock-jwt-token-admin-2026');
  });

  it('显示搜索框和类型筛选', async () => {
    const { intelligenceMock } = await import('../mock/intelligence');
    intelligenceMock(mock);

    renderWithProviders(<SearchPage />);

    expect(screen.getByPlaceholderText(/输入关键词/)).toBeInTheDocument();
    expect(screen.getByText('全部')).toBeInTheDocument();
    expect(screen.getByText('公告')).toBeInTheDocument();
    expect(screen.getByText('审批')).toBeInTheDocument();
  });

  it('输入关键词搜索显示结果', async () => {
    const { intelligenceMock } = await import('../mock/intelligence');
    intelligenceMock(mock);

    renderWithProviders(<SearchPage />);

    const input = screen.getByPlaceholderText(/输入关键词/);
    fireEvent.change(input, { target: { value: '暑期' } });
    fireEvent.click(screen.getByText(/搜.*索/));

    await waitFor(() => {
      expect(screen.getByText('关于2026年暑期放假安排的通知')).toBeInTheDocument();
    });
  });

  it('搜索结果包含来源和时间信息', async () => {
    const { intelligenceMock } = await import('../mock/intelligence');
    intelligenceMock(mock);

    renderWithProviders(<SearchPage />);

    const input = screen.getByPlaceholderText(/输入关键词/);
    fireEvent.change(input, { target: { value: '打卡' } });
    fireEvent.click(screen.getByText(/搜.*索/));

    await waitFor(() => {
      expect(screen.getByText('关于调整考勤打卡时间的通知')).toBeInTheDocument();
      expect(screen.getAllByText('行政通知').length).toBeGreaterThan(0);
    });
  });

  it('按审批类型筛选结果', async () => {
    const { intelligenceMock } = await import('../mock/intelligence');
    intelligenceMock(mock);

    renderWithProviders(<SearchPage />);

    const input = screen.getByPlaceholderText(/输入关键词/);
    fireEvent.change(input, { target: { value: '加班' } });
    fireEvent.click(screen.getByText('审批'));
    fireEvent.click(screen.getByText(/搜.*索/));

    await waitFor(() => {
      expect(screen.getByText('加班申请 - 赵工程师')).toBeInTheDocument();
    });
  });

  it('搜索结果包含总数统计', async () => {
    const { intelligenceMock } = await import('../mock/intelligence');
    intelligenceMock(mock);

    renderWithProviders(<SearchPage />);

    const input = screen.getByPlaceholderText(/输入关键词/);
    fireEvent.change(input, { target: { value: '前端' } });
    fireEvent.click(screen.getByText(/搜.*索/));

    await waitFor(() => {
      expect(screen.getByText(/共找到/)).toBeInTheDocument();
    });
  });

  it('关键词为空时显示空状态', async () => {
    const { intelligenceMock } = await import('../mock/intelligence');
    intelligenceMock(mock);

    renderWithProviders(<SearchPage />);

    fireEvent.click(screen.getByText(/搜.*索/));

    await waitFor(() => {
      expect(screen.getByText('未找到相关结果')).toBeInTheDocument();
    });
  });
});
