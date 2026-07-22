import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MockAdapter from 'axios-mock-adapter';
import { App } from 'antd';
import { client } from '../api/client';

// Mock EChart 组件，避免 jsdom 环境下 echarts 初始化失败
vi.mock('../components/EChart', () => ({
  default: ({ height }: { option: unknown; height?: number }) =>
    React.createElement('div', { 'data-testid': 'echart', style: { height } }),
}));

// 延迟导入，确保 mock 生效
const DashboardPage = (await import('../views/Dashboard')).default;

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <App>
      <MemoryRouter>{ui}</MemoryRouter>
    </App>,
  );
}

describe('数据驾驶舱页面', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(client);
    localStorage.setItem('oa_token', 'mock-jwt-token-admin-2026');
  });

  it('显示驾驶舱标题', async () => {
    const { intelligenceMock } = await import('../mock/intelligence');
    intelligenceMock(mock);

    renderWithProviders(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('数据驾驶舱')).toBeInTheDocument();
    });
  });

  it('加载后显示组织概览统计卡片', async () => {
    const { intelligenceMock } = await import('../mock/intelligence');
    intelligenceMock(mock);

    renderWithProviders(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('总人数')).toBeInTheDocument();
      expect(screen.getByText('部门数')).toBeInTheDocument();
      expect(screen.getByText('本月入职')).toBeInTheDocument();
      expect(screen.getByText('离职率')).toBeInTheDocument();
    });
  });

  it('显示考勤概览统计', async () => {
    const { intelligenceMock } = await import('../mock/intelligence');
    intelligenceMock(mock);

    renderWithProviders(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('今日出勤率')).toBeInTheDocument();
      expect(screen.getByText('今日迟到')).toBeInTheDocument();
      expect(screen.getByText('今日缺勤')).toBeInTheDocument();
      expect(screen.getByText('请假中')).toBeInTheDocument();
    });
  });

  it('显示审批概览统计', async () => {
    const { intelligenceMock } = await import('../mock/intelligence');
    intelligenceMock(mock);

    renderWithProviders(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('待审批')).toBeInTheDocument();
      expect(screen.getByText('已通过')).toBeInTheDocument();
      expect(screen.getAllByText('已驳回').length).toBeGreaterThan(0);
      expect(screen.getByText('本月总量')).toBeInTheDocument();
    });
  });

  it('显示公告概览统计', async () => {
    const { intelligenceMock } = await import('../mock/intelligence');
    intelligenceMock(mock);

    renderWithProviders(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('公告总数')).toBeInTheDocument();
      expect(screen.getByText('本月发布')).toBeInTheDocument();
      expect(screen.getByText('总阅读量')).toBeInTheDocument();
      expect(screen.getByText('平均阅读率')).toBeInTheDocument();
    });
  });

  it('渲染 8 个图表区域', async () => {
    const { intelligenceMock } = await import('../mock/intelligence');
    intelligenceMock(mock);

    renderWithProviders(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('部门人数分布')).toBeInTheDocument();
      expect(screen.getByText('人员数量趋势')).toBeInTheDocument();
      expect(screen.getByText('考勤状态分布')).toBeInTheDocument();
      expect(screen.getByText('考勤趋势（近7天）')).toBeInTheDocument();
      expect(screen.getByText('审批类型分布')).toBeInTheDocument();
      expect(screen.getByText('审批趋势')).toBeInTheDocument();
      expect(screen.getByText('公告分类分布')).toBeInTheDocument();
      expect(screen.getByText('公告发布与阅读趋势')).toBeInTheDocument();
    });

    const charts = screen.getAllByTestId('echart');
    expect(charts.length).toBe(8);
  });
});
