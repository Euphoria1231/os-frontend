import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { client } from '../api/client';
import { App } from 'antd';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import LeaveApplyPage from '../views/Flow/LeaveApply';
import OvertimeApplyPage from '../views/Flow/OvertimeApply';
import MyApplicationsPage from '../views/Flow/MyApplications';
import TodoTasksPage from '../views/Flow/TodoTasks';

function renderWithProviders(ui: React.ReactElement, initialPath = '/test') {
  return render(
    <App>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/test" element={ui} />
          <Route path="/flow/applications" element={<div>My Applications Page</div>} />
        </Routes>
      </MemoryRouter>
    </App>,
  );
}

describe('审批页面', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(client);
    localStorage.setItem('oa_token', 'mock-jwt-token-admin-2026');
  });

  describe('请假申请页面', () => {
    it('显示请假申请表单', async () => {
      renderWithProviders(<LeaveApplyPage />);

      expect(screen.getByText('请假申请')).toBeInTheDocument();
      expect(screen.getByText('请假类型')).toBeInTheDocument();
      expect(screen.getByText('请假时间')).toBeInTheDocument();
      expect(screen.getByText('请假原因')).toBeInTheDocument();
    });

    it('提交时未填写必填字段显示校验错误', async () => {
      renderWithProviders(<LeaveApplyPage />);

      fireEvent.click(screen.getByRole('button', { name: /提交申请/ }));

      await waitFor(() => {
        expect(screen.getAllByText('请选择请假类型').length).toBeGreaterThan(0);
        expect(screen.getByText('请选择请假时间')).toBeInTheDocument();
        expect(screen.getByText('请填写请假原因')).toBeInTheDocument();
      });
    });
  });

  describe('加班申请页面', () => {
    it('显示加班申请表单', async () => {
      renderWithProviders(<OvertimeApplyPage />);

      expect(screen.getByText('加班申请')).toBeInTheDocument();
      expect(screen.getByText('加班日期')).toBeInTheDocument();
      expect(screen.getByText('加班时间段')).toBeInTheDocument();
      expect(screen.getByText('加班原因')).toBeInTheDocument();
    });

    it('提交时未填写必填字段显示校验错误', async () => {
      renderWithProviders(<OvertimeApplyPage />);

      fireEvent.click(screen.getByRole('button', { name: /提交申请/ }));

      await waitFor(() => {
        expect(screen.getByText('请选择加班日期')).toBeInTheDocument();
        expect(screen.getByText('请选择加班时间段')).toBeInTheDocument();
        expect(screen.getByText('请填写加班原因')).toBeInTheDocument();
      });
    });
  });

  describe('我的申请页面', () => {
    it('显示申请列表表格', async () => {
      const { flowMock } = await import('../mock/flow');
      flowMock(mock);

      renderWithProviders(<MyApplicationsPage />);

      await waitFor(() => {
        expect(screen.getByText('类型')).toBeInTheDocument();
        expect(screen.getByText('状态')).toBeInTheDocument();
      });
    });
  });

  describe('待办任务页面', () => {
    it('显示待办任务列表', async () => {
      const { flowMock } = await import('../mock/flow');
      flowMock(mock);

      renderWithProviders(<TodoTasksPage />);

      await waitFor(() => {
        expect(screen.getByText('申请人')).toBeInTheDocument();
        expect(screen.getByText('操作')).toBeInTheDocument();
      });
    });

    it('点击驳回弹出驳回意见弹窗', async () => {
      const { flowMock } = await import('../mock/flow');
      flowMock(mock);

      renderWithProviders(<TodoTasksPage />);

      await waitFor(() => {
        expect(screen.getByText('申请人')).toBeInTheDocument();
      });

      // 找到驳回按钮并点击
      const rejectButtons = screen.getAllByRole('button', { name: /驳回/ });
      if (rejectButtons.length > 0) {
        fireEvent.click(rejectButtons[0]);

        await waitFor(() => {
          expect(screen.getByText('驳回审批')).toBeInTheDocument();
          expect(screen.getByPlaceholderText(/请填写驳回意见/)).toBeInTheDocument();
        });
      }
    });
  });
});
