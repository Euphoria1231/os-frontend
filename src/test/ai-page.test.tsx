import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MockAdapter from 'axios-mock-adapter';
import { App } from 'antd';
import { client } from '../api/client';
import AssistantPage from '../views/AI/Assistant';

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <App>
      <MemoryRouter>{ui}</MemoryRouter>
    </App>,
  );
}

describe('智能办公助手页面', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(client);
    localStorage.setItem('oa_token', 'mock-jwt-token-admin-2026');
  });

  it('显示考勤智能分析卡片', async () => {
    const { intelligenceMock } = await import('../mock/intelligence');
    intelligenceMock(mock);

    renderWithProviders(<AssistantPage />);

    await waitFor(() => {
      expect(screen.getByText('考勤智能分析')).toBeInTheDocument();
    });
  });

  it('分析卡片显示考勤指标', async () => {
    const { intelligenceMock } = await import('../mock/intelligence');
    intelligenceMock(mock);

    renderWithProviders(<AssistantPage />);

    await waitFor(() => {
      expect(screen.getByText('出勤率')).toBeInTheDocument();
      expect(screen.getByText('迟到')).toBeInTheDocument();
      expect(screen.getAllByText('早退').length).toBeGreaterThan(0);
      expect(screen.getAllByText('缺勤').length).toBeGreaterThan(0);
    });
  });

  it('显示快捷问题按钮', async () => {
    const { intelligenceMock } = await import('../mock/intelligence');
    intelligenceMock(mock);

    renderWithProviders(<AssistantPage />);

    await waitFor(() => {
      expect(screen.getByText('考勤智能分析')).toBeInTheDocument();
    });

    expect(screen.getByText('帮我分析一下本周的考勤情况')).toBeInTheDocument();
    expect(screen.getByText('我有哪些待办审批？')).toBeInTheDocument();
  });

  it('输入问题并提交显示AI回答', async () => {
    const { intelligenceMock } = await import('../mock/intelligence');
    intelligenceMock(mock);

    renderWithProviders(<AssistantPage />);

    // 等待分析卡片加载完成
    await waitFor(() => {
      expect(screen.getByText('考勤智能分析')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('输入你的问题...');
    fireEvent.change(input, { target: { value: '帮我分析一下本周的考勤情况' } });

    // 等待按钮变为可用
    await waitFor(() => {
      const sendBtn = screen.getByText('发送');
      expect(sendBtn.closest('button')).not.toBeDisabled();
    });

    fireEvent.click(screen.getByText('发送'));

    await waitFor(() => {
      expect(screen.getByText(/出勤率：本周应出勤5天/)).toBeInTheDocument();
    });
  });

  it('AI回答显示建议标签', async () => {
    const { intelligenceMock } = await import('../mock/intelligence');
    intelligenceMock(mock);

    renderWithProviders(<AssistantPage />);

    await waitFor(() => {
      expect(screen.getByText('考勤智能分析')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('输入你的问题...');
    fireEvent.change(input, { target: { value: '我有哪些待办审批？' } });

    await waitFor(() => {
      const sendBtn = screen.getByText('发送');
      expect(sendBtn.closest('button')).not.toBeDisabled();
    });

    fireEvent.click(screen.getByText('发送'));

    await waitFor(() => {
      expect(screen.getByText('优先处理紧急的加班申请')).toBeInTheDocument();
    });
  });

  it('分析卡片显示风险提示', async () => {
    const { intelligenceMock } = await import('../mock/intelligence');
    intelligenceMock(mock);

    renderWithProviders(<AssistantPage />);

    await waitFor(() => {
      expect(screen.getByText(/本月有1次迟到记录/)).toBeInTheDocument();
    });
  });
});
