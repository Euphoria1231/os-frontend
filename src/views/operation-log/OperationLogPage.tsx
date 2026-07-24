import { memo } from 'react'
import {
  ClockCircleOutlined,
  ReloadOutlined,
  SearchOutlined,
  UserOutlined,
} from '@ant-design/icons'
import {
  Alert,
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  type TableProps,
} from 'antd'
import type { Dayjs } from 'dayjs'
import { PageHeader } from '../../components/common/PageHeader.tsx'
import { useAuth } from '../../hooks/auth/useAuth.ts'
import { useOperationLogs } from '../../hooks/operation-log/useOperationLogs.ts'
import type {
  OperationLog,
  OperationLogStatus,
} from '../../services/operation-log/operation-log.types.ts'
import { formatDateTime } from '../../utils/date.ts'
import { getErrorMessage } from '../../utils/error.ts'
import './OperationLogPage.less'

const { RangePicker } = DatePicker

interface OperationLogFilterValues {
  operatorKeyword?: string
  businessModule?: string
  operationStatus?: OperationLogStatus
  operatedAt?: [Dayjs, Dayjs]
}

const MODULE_LABELS: Record<string, string> = {
  AUTH: '登录认证',
  ORGANIZATION: '组织管理',
  RBAC: '权限管理',
  ATTENDANCE: '考勤打卡',
  FLOW: '流程审批',
  NOTICE: '公告通知',
  SEARCH: '搜索索引',
  AI: '智能办公',
}

const OPERATION_LABELS: Record<string, string> = {
  LOGIN: '登录',
  LOGOUT: '退出登录',
  CREATE_DEPARTMENT: '新增部门',
  UPDATE_DEPARTMENT: '修改部门',
  DELETE_DEPARTMENT: '删除部门',
  CREATE_POSITION: '新增岗位',
  UPDATE_POSITION: '修改岗位',
  DELETE_POSITION: '删除岗位',
  CREATE_EMPLOYEE: '新增员工',
  UPDATE_EMPLOYEE: '修改员工',
  DELETE_EMPLOYEE: '删除员工',
  ASSIGN_EMPLOYEE_ROLES: '分配员工角色',
  ASSIGN_ROLE_PERMISSIONS: '修改角色权限',
  CLOCK_IN: '上班打卡',
  CLOCK_OUT: '下班打卡',
  SUBMIT_LEAVE: '提交请假',
  SUBMIT_OVERTIME: '提交加班',
  SUBMIT_MAKEUP: '提交补签',
  APPROVE_APPLICATION: '审批同意',
  REJECT_APPLICATION: '审批驳回',
  PUBLISH_NOTICE: '发布公告',
  UPDATE_NOTICE: '修改公告',
  DELETE_NOTICE: '删除公告',
  REBUILD_INDEX: '重建索引',
  AI_ANALYSIS: 'AI 分析',
}

const MODULE_OPTIONS = Object.entries(MODULE_LABELS).map(([value, label]) => ({
  value,
  label,
}))

function statusTag(status: OperationLogStatus) {
  return status === 'SUCCESS'
    ? <Tag color="success">成功</Tag>
    : <Tag color="error">失败</Tag>
}

export const OperationLogPage = memo(function OperationLogPage() {
  const [form] = Form.useForm<OperationLogFilterValues>()
  const { isSuperAdmin } = useAuth()
  const { logs, total, query, loading, error, applyQuery, reload } = useOperationLogs(
    isSuperAdmin,
  )

  const handleSearch = (values: OperationLogFilterValues) => {
    const range = values.operatedAt
    applyQuery({
      operatorKeyword: isSuperAdmin ? values.operatorKeyword?.trim() || undefined : undefined,
      businessModule: values.businessModule,
      operationStatus: values.operationStatus,
      startTime: range?.[0].startOf('minute').format('YYYY-MM-DDTHH:mm:ss'),
      endTime: range?.[1].endOf('minute').format('YYYY-MM-DDTHH:mm:ss'),
      page: 1,
      pageSize: query.pageSize,
    })
  }

  const handleReset = () => {
    form.resetFields()
    applyQuery({ page: 1, pageSize: query.pageSize })
  }

  const handleTableChange: TableProps<OperationLog>['onChange'] = (pagination) => {
    applyQuery({
      ...query,
      page: pagination.current ?? 1,
      pageSize: pagination.pageSize ?? 20,
    })
  }

  const columns: TableProps<OperationLog>['columns'] = [
    {
      title: '操作时间',
      dataIndex: 'operatedAt',
      key: 'operatedAt',
      width: 168,
      render: (value: string) => (
        <Space size={6}>
          <ClockCircleOutlined className="operation-log-muted-icon" />
          <Typography.Text>{formatDateTime(value)}</Typography.Text>
        </Space>
      ),
    },
    {
      title: '操作人',
      key: 'operator',
      width: 150,
      render: (_, record) => (
        <div className="operation-log-operator">
          <Typography.Text strong><UserOutlined /> {record.operatorName}</Typography.Text>
        </div>
      ),
    },
    {
      title: '业务操作',
      key: 'operation',
      width: 178,
      render: (_, record) => (
        <div className="operation-log-operation">
          <Tag bordered={false} style={{fontSize: 14}}>{MODULE_LABELS[record.businessModule] ?? record.businessModule}</Tag>
        </div>
      ),
    },
    {
      title: '操作摘要',
      key: 'summary',
      width: 280,
      render: (_, record) => (
        <div className="operation-log-summary">
          <Typography.Text>{record.summary || '未提供操作摘要'}</Typography.Text>
          
        </div>
      ),
    },
    {
      title: '结果',
      dataIndex: 'operationStatus',
      key: 'operationStatus',
      width: 90,
      align: 'center',
      render: statusTag,
    },
    {
      title: '请求信息',
      key: 'request',
      width: 260,
      render: (_, record) => (
        <div className="operation-log-request">
          <Space size={6}>
            <Tag>{record.httpMethod}</Tag>
            <Typography.Text ellipsis={{ tooltip: record.requestPath }}>
              {record.requestPath}
            </Typography.Text>
          </Space>
          <Typography.Text type="secondary">
            {record.serviceName} · {record.clientIp || '未知 IP'}
          </Typography.Text>
        </div>
      ),
    },
  ]

  return (
    <section className="operation-log-page">
      <PageHeader
        eyebrow=""
        title="业务操作日志"
        description={
          ""
        }
        extra={
          <Button icon={<ReloadOutlined />} loading={loading} onClick={reload}>
            刷新记录
          </Button>
        }
      />

      {Boolean(error) && (
        <Alert
          className="operation-log-error-alert"
          type="warning"
          showIcon
          message="操作日志暂时无法加载"
          description={getErrorMessage(error, '请稍后重试')}
          action={<Button size="small" onClick={reload}>重新加载</Button>}
        />
      )}

      <Card bordered={false} className="operation-log-card">
        <Form<OperationLogFilterValues>
          form={form}
          className="operation-log-filters"
          layout="inline"
          onFinish={handleSearch}
        >
          {isSuperAdmin && (
            <Form.Item name="operatorKeyword" label="操作人">
              <Input allowClear prefix={<SearchOutlined />} placeholder="姓名 / 员工 ID" />
            </Form.Item>
          )}
          <Form.Item name="businessModule" label="业务模块">
            <Select allowClear placeholder="全部模块" options={MODULE_OPTIONS} />
          </Form.Item>
          <Form.Item name="operationStatus" label="操作结果">
            <Select
              allowClear
              placeholder="全部结果"
              options={[
                { value: 'SUCCESS', label: '成功' },
                { value: 'FAILURE', label: '失败' },
              ]}
            />
          </Form.Item>
          <Form.Item name="operatedAt" label="操作时间">
            <RangePicker showTime format="YYYY-MM-DD HH:mm" />
          </Form.Item>
          <Form.Item className="operation-log-filter-actions">
            <Space>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                查询
              </Button>
              <Button onClick={handleReset}>重置</Button>
            </Space>
          </Form.Item>
        </Form>

        <div className="operation-log-table-heading">
          <div>
            <Typography.Title level={4}>操作记录</Typography.Title>
            <Typography.Text type="secondary">共 {total} 条符合条件的记录</Typography.Text>
          </div>
          <Typography.Text type="secondary">失败原因已由后端统一脱敏</Typography.Text>
        </div>

        <Table<OperationLog>
          rowKey="id"
          columns={columns}
          dataSource={logs}
          loading={loading}
          scroll={{ x: 1280 }}
          locale={{ emptyText: '暂无符合条件的操作日志' }}
          pagination={{
            current: query.page,
            pageSize: query.pageSize,
            total,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50, 100],
            showTotal: (count) => `共 ${count} 条`,
          }}
          onChange={handleTableChange}
        />
      </Card>
    </section>
  )
})
