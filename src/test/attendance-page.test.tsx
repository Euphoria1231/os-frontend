import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { client } from '../api/client';
import { App } from 'antd';
import ClockPage from '../views/Attendance/Clock';
import RecordsPage from '../views/Attendance/Records';
import { resetAttendanceMock } from '../mock/attendance';

function renderWithApp(ui: React.ReactElement) {
  return render(<App>{ui}</App>);
}

describe('考勤页面', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(client);
    resetAttendanceMock();
    localStorage.setItem('oa_token', 'mock-jwt-token-admin-2026');
  });

  describe('打卡页面', () => {
    it('显示今日未打卡状态', async () => {
      const { attendanceMock } = await import('../mock/attendance');
      attendanceMock(mock);

      renderWithApp(<ClockPage />);

      await waitFor(() => {
        expect(screen.getByText('未打卡')).toBeInTheDocument();
      });
    });

    it('上班打卡成功后显示成功消息', async () => {
      const { attendanceMock } = await import('../mock/attendance');
      attendanceMock(mock);

      renderWithApp(<ClockPage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /上班打卡/ })).not.toBeDisabled();
      });

      fireEvent.click(screen.getByRole('button', { name: /上班打卡/ }));

      await waitFor(() => {
        expect(screen.getByText(/上班打卡成功/)).toBeInTheDocument();
      });
    });

    it('已上班打卡后上班按钮禁用（防重复提交）', async () => {
      const { attendanceMock } = await import('../mock/attendance');
      attendanceMock(mock);

      // 先打卡
      await import('../api/attendance').then((m) => m.clockIn());

      renderWithApp(<ClockPage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /上班打卡/ })).toBeDisabled();
      });
    });

    it('未上班打卡时下班按钮禁用', async () => {
      const { attendanceMock } = await import('../mock/attendance');
      attendanceMock(mock);

      renderWithApp(<ClockPage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /下班打卡/ })).toBeDisabled();
      });
    });
  });

  describe('考勤记录页面', () => {
    it('显示考勤记录表格', async () => {
      const { attendanceMock } = await import('../mock/attendance');
      attendanceMock(mock);

      renderWithApp(<RecordsPage />);

      await waitFor(() => {
        expect(screen.getByText('日期')).toBeInTheDocument();
      });
    });

    it('表格包含记录数据', async () => {
      const { attendanceMock } = await import('../mock/attendance');
      attendanceMock(mock);

      renderWithApp(<RecordsPage />);

      await waitFor(() => {
        const cells = screen.getAllByText(/\d{4}-\d{2}-\d{2}/);
        expect(cells.length).toBeGreaterThan(0);
      });
    });
  });
});
