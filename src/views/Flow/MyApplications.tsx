import { Table, Typography, Tag, Button, Card, Space, Modal, Steps, Empty, App } from 'antd';
import { PlusOutlined, ReloadOutlined, HistoryOutlined, RollbackOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useState, useCallback } from 'react';
import type { ColumnsType } from 'antd/es/table';
import { useMyApplications, useApprovalHistory } from '../../hooks/useFlow';
import * as flowApi from '../../api/flow';
import type { LeaveApplication, OvertimeApplication } from '../../types/flow';
import type { ApplicationStatus } from '../../types/flow';

const { Title, Text } = Typography;

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; color: string }> = {
  pending: { label: '待审批', color: 'processing' },
  approved: { label: '已通过', color: 'success' },
  rejected: { label: '已驳回', color: 'error' },
  withdrawn: { label: '已撤回', color: 'default' },
};

const LEAVE_TYPE_LABELS: Record<string, string> = {
  annual_leave: '年假',
  sick_leave: '病假',
  personal_leave: '事假',
  marriage_leave: '婚假',
  maternity_leave: '产假',
};

function isLeave(app: LeaveApplication | OvertimeApplication): app is LeaveApplication {
  return 'startDate' in app;
}

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: '待处理', color: 'processing' },
  approved: { label: '同意', color: 'success' },
  rejected: { label: '驳回', color: 'error' },
};

export default function MyApplicationsPage() {
  const navigate = useNavigate();
  const { applications, total, loading, pageNum, pageSize, setPageNum, setPageSize, fetchApplications } =
    useMyApplications();
  const { message } = App.useApp();
  const [historyAppId, setHistoryAppId] = useState<number | null>(null);
  const [withdrawing, setWithdrawing] = useState<number | null>(null);
  const { history, loading: historyLoading } = useApprovalHistory(historyAppId);

  const handleWithdraw = useCallback(async (taskId: number) => {
    if (withdrawing !== null) return;
    setWithdrawing(taskId);
    try {
      await flowApi.withdrawTask(taskId);
      message.success('申请已撤回');
      fetchApplications();
    } catch {
      // 错误由拦截器处理
    } finally {
      setWithdrawing(null);
    }
  }, [withdrawing, fetchApplications, message]);

  const columns: ColumnsType<LeaveApplication | OvertimeApplication> = [
    {
      title: '类型',
      key: 'type',
      width: 100,
      render: (_, record) => {
        if (isLeave(record)) {
          return <Tag>{LEAVE_TYPE_LABELS[record.type] || record.type}</Tag>;
        }
        return <Tag color="orange">加班</Tag>;
      },
    },
    {
      title: '时间',
      key: 'time',
      width: 200,
      render: (_, record) => {
        if (isLeave(record)) {
          return `${record.startDate} ~ ${record.endDate}`;
        }
        return `${record.date} ${record.startTime}~${record.endTime}`;
      },
    },
    {
      title: '天数/时长',
      key: 'duration',
      width: 100,
      render: (_, record) => {
        if (isLeave(record)) {
          return `${record.days} 天`;
        }
        return `${record.hours} 小时`;
      },
    },
    {
      title: '原因',
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: ApplicationStatus) => {
        const config = STATUS_CONFIG[status];
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: '提交时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<HistoryOutlined />}
            onClick={() => setHistoryAppId(record.id)}
          >
            历史
          </Button>
          {record.status === 'pending' && record.currentTaskId && (
            <Button
              size="small"
              danger
              icon={<RollbackOutlined />}
              loading={withdrawing === record.currentTaskId}
              disabled={withdrawing !== null}
              onClick={() => handleWithdraw(record.currentTaskId!)}
            >
              撤回
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={3}>我的申请</Title>

      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/flow/apply/leave')}
          >
            请假申请
          </Button>
          <Button
            icon={<PlusOutlined />}
            onClick={() => navigate('/flow/apply/overtime')}
          >
            加班申请
          </Button>
          <Button icon={<ReloadOutlined />} onClick={fetchApplications}>
            刷新
          </Button>
        </Space>

        <Table<LeaveApplication | OvertimeApplication>
          columns={columns}
          dataSource={applications}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pageNum,
            pageSize,
            total,
            showSizeChanger: true,
            showTotal: (t) => `共 ${t} 条`,
            onChange: (page, size) => {
              setPageNum(page);
              setPageSize(size || 10);
            },
          }}
          locale={{ emptyText: '暂无申请记录' }}
        />
      </Card>

      <Modal
        title="审批历史"
        open={historyAppId !== null}
        onCancel={() => setHistoryAppId(null)}
        footer={<Button onClick={() => setHistoryAppId(null)}>关闭</Button>}
        width={600}
      >
        {historyLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>加载中...</div>
        ) : history.length > 0 ? (
          <Steps
            direction="vertical"
            current={history.length - 1}
            items={history.map((step) => ({
              title: (
                <Space>
                  <Text strong>{step.approverName}</Text>
                  <Tag color={ACTION_LABELS[step.action]?.color || 'default'}>
                    {ACTION_LABELS[step.action]?.label || step.action}
                  </Tag>
                </Space>
              ),
              description: (
                <Space direction="vertical" size={2}>
                  {step.comment && <Text type="secondary">{step.comment}</Text>}
                  {step.time && <Text type="secondary" style={{ fontSize: 12 }}>{step.time}</Text>}
                </Space>
              ),
            }))}
          />
        ) : (
          <Empty description="暂无审批历史" />
        )}
      </Modal>
    </div>
  );
}
