import { Table, Typography, Tag, Button, Card, Modal, Input, Space, App } from 'antd';
import { CheckOutlined, CloseOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useState } from 'react';
import { useTodoTasks } from '../../hooks/useFlow';
import type { FlowTask } from '../../types/flow';

const { Title } = Typography;
const { TextArea } = Input;

const TYPE_LABELS: Record<string, string> = {
  leave: '请假',
  overtime: '加班',
};

export default function TodoTasksPage() {
  const { tasks, total, loading, pageNum, pageSize, approving, rejecting, setPageNum, setPageSize, fetchTasks, approve, reject } =
    useTodoTasks();
  const { message } = App.useApp();
  const [rejectModal, setRejectModal] = useState<{ taskId: number; summary: string } | null>(null);
  const [rejectComment, setRejectComment] = useState('');

  const handleApprove = async (taskId: number) => {
    const success = await approve(taskId);
    if (success) {
      message.success('已同意审批');
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectModal) return;
    if (!rejectComment.trim()) {
      message.warning('请填写驳回意见');
      return;
    }
    const success = await reject(rejectModal.taskId, rejectComment);
    if (success) {
      message.success('已驳回审批');
      setRejectModal(null);
      setRejectComment('');
    }
  };

  const columns: ColumnsType<FlowTask> = [
    {
      title: '申请人',
      dataIndex: 'applicantName',
      key: 'applicantName',
      width: 100,
    },
    {
      title: '部门',
      dataIndex: 'applicantDept',
      key: 'applicantDept',
      width: 100,
    },
    {
      title: '类型',
      key: 'type',
      width: 80,
      render: (_, record) => <Tag>{TYPE_LABELS[record.type] || record.type}</Tag>,
    },
    {
      title: '摘要',
      dataIndex: 'summary',
      key: 'summary',
      ellipsis: true,
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
      width: 180,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<CheckOutlined />}
            loading={approving === record.id}
            disabled={rejecting !== null || approving !== null}
            onClick={() => handleApprove(record.id)}
          >
            同意
          </Button>
          <Button
            danger
            size="small"
            icon={<CloseOutlined />}
            loading={rejecting === record.id}
            disabled={approving !== null || rejecting !== null}
            onClick={() => {
              setRejectModal({ taskId: record.id, summary: record.summary });
              setRejectComment('');
            }}
          >
            驳回
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={3}>待办任务</Title>

      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Button icon={<ReloadOutlined />} onClick={fetchTasks}>
            刷新
          </Button>
        </Space>

        <Table<FlowTask>
          columns={columns}
          dataSource={tasks}
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
          locale={{ emptyText: '暂无待办任务' }}
        />
      </Card>

      <Modal
        title="驳回审批"
        open={!!rejectModal}
        onOk={handleRejectConfirm}
        onCancel={() => {
          setRejectModal(null);
          setRejectComment('');
        }}
        okText="确认驳回"
        cancelText="取消"
        okButtonProps={{ danger: true, loading: rejecting !== null }}
      >
        <p style={{ marginBottom: 8 }}>
          <strong>任务摘要：</strong>
          {rejectModal?.summary}
        </p>
        <TextArea
          rows={4}
          placeholder="请填写驳回意见（必填）"
          value={rejectComment}
          onChange={(e) => setRejectComment(e.target.value)}
          maxLength={200}
          showCount
        />
      </Modal>
    </div>
  );
}
