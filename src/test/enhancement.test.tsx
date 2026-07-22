import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { client } from '../api/client';
import { App } from 'antd';
import StatisticsPage from '../views/Attendance/Statistics';
import MyApplicationsPage from '../views/Flow/MyApplications';
import { MemoryRouter } from 'react-router-dom';
import { resetAttendanceMock } from '../mock/attendance';

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <App>
      <MemoryRouter>{ui}</MemoryRouter>
    </App>,
  );
}

describe('报表下载与流程增强', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(client);
    resetAttendanceMock();
    localStorage.setItem('oa_token', 'mock-jwt-token-admin-2026');
  });

  describe('考勤报表下载', () => {
    it('统计页面显示下载按钮', async () => {
      const { attendanceMock } = await import('../mock/attendance');
      attendanceMock(mock);

      renderWithProviders(<StatisticsPage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /下载月度报表/ })).toBeInTheDocument();
      });
    });

    it('点击下载按钮触发文件下载', async () => {
      const { attendanceMock } = await import('../mock/attendance');
      attendanceMock(mock);

      // Mock URL.createObjectURL and link.click
      const originalCreateObjectURL = URL.createObjectURL;
      const originalRevokeObjectURL = URL.revokeObjectURL;
      URL.createObjectURL = () => 'mock-url';
      URL.revokeObjectURL = () => {};

      renderWithProviders(<StatisticsPage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /下载月度报表/ })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /下载月度报表/ }));

      await waitFor(() => {
        expect(screen.getByText(/报表下载成功/)).toBeInTheDocument();
      });

      URL.createObjectURL = originalCreateObjectURL;
      URL.revokeObjectURL = originalRevokeObjectURL;
    });
  });

  describe('审批历史', () => {
    it('我的申请列表显示历史按钮', async () => {
      const { flowMock } = await import('../mock/flow');
      flowMock(mock);

      renderWithProviders(<MyApplicationsPage />);

      await waitFor(() => {
        expect(screen.getAllByText('历史').length).toBeGreaterThan(0);
      });
    });

    it('点击历史按钮弹出审批历史弹窗', async () => {
      const { flowMock } = await import('../mock/flow');
      flowMock(mock);

      renderWithProviders(<MyApplicationsPage />);

      await waitFor(() => {
        expect(screen.getAllByText('历史').length).toBeGreaterThan(0);
      });

      // 点击第一个历史按钮
      const historyButtons = screen.getAllByText('历史');
      fireEvent.click(historyButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('审批历史')).toBeInTheDocument();
      });
    });
  });

  describe('撤回功能', () => {
    it('待审批的申请显示撤回按钮', async () => {
      const { flowMock } = await import('../mock/flow');
      flowMock(mock);

      renderWithProviders(<MyApplicationsPage />);

      await waitFor(() => {
        const withdrawButtons = screen.getAllByText('撤回');
        expect(withdrawButtons.length).toBeGreaterThan(0);
      });
    });
  });
});
