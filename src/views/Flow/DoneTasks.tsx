import { Table, Typography, Tag, Button, Card, Space } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useDoneTasks } from '../../hooks/useFlow';
import type { DoneTask } from '../../types/flow';

const { Title } = Typography;

const TYPE_LABELS: Record<string, string> = {
  leave: '请假',
  overtime: '加班',
};

const RESULT_CONFIG: Record<string, { label: string; color: string }> = {
  approved: { label: '已同意', color: 'success' },
  rejected: { label: '已驳回', color: 'error' },
};

const columns: ColumnsType<DoneTask> = [
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
    title: '审批结果',
    dataIndex: 'result',
    key: 'result',
    width: 100,
    render: (result: string) => {
      const config = RESULT_CONFIG[result] || { label: result, color: 'default' };
      return <Tag color={config.color}>{config.label}</Tag>;
    },
  },
  {
    title: '审批意见',
    dataIndex: 'comment',
    key: 'comment',
    ellipsis: true,
    render: (comment: string) => comment || '--',
  },
  {
    title: '处理时间',
    dataIndex: 'processedAt',
    key: 'processedAt',
    width: 180,
  },
];

export default function DoneTasksPage() {
  const { tasks, total, loading, pageNum, pageSize, setPageNum, setPageSize, fetchTasks } =
    useDoneTasks();

  return (
    <div>
      <Title level={3}>已办任务</Title>

      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Button icon={<ReloadOutlined />} onClick={fetchTasks}>
            刷新
          </Button>
        </Space>

        <Table<DoneTask>
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
          locale={{ emptyText: '暂无已办任务' }}
        />
      </Card>
    </div>
  );
}
