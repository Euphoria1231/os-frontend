import { memo, useState } from 'react'
import {
  CheckOutlined,
  ClockCircleOutlined,
  CloseOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import {
  Alert,
  App,
  Button,
  Card,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Space,
  Statistic,
  Table,
  Tabs,
  Typography,
  type TableProps,
} from 'antd'
import { ApprovalActionTag, ApplicationTypeTag } from '../../components/flow/FlowTags.tsx'
import { PageHeader } from '../../components/common/PageHeader.tsx'
import { useAuth } from '../../hooks/auth/useAuth.ts'
import { useApprovalTasks } from '../../hooks/flow/useApprovalTasks.ts'
import type {
  ApprovalRequest,
  ApprovalTask,
  FlowApplication,
} from '../../services/flow/flow.types.ts'
import { formatDateTime } from '../../utils/date.ts'
import { getErrorMessage } from '../../utils/error.ts'
import './FlowPage.less'

type ProcessAction = 'approve' | 'reject'

export const ApprovalPage = memo(function ApprovalPage() {
  const [form] = Form.useForm<ApprovalRequest>()
  const [processTarget, setProcessTarget] = useState<FlowApplication | null>(null)
  const [processAction, setProcessAction] = useState<ProcessAction>('approve')
  const [modalOpen, setModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const { message } = App.useApp()
  const { hasAuthority } = useAuth()
  const { todo, done, loading, error, reload, processApplication } = useApprovalTasks()
  const canProcess = hasAuthority('POST:/api/flow/tasks/**')

  const openProcessModal = (application: FlowApplication, action: ProcessAction) => {
    setProcessTarget(application)
    setProcessAction(action)
    form.setFieldsValue({ comment: null })
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setProcessTarget(null)
    form.resetFields()
  }

  const handleProcess = async (values: ApprovalRequest) => {
    if (!processTarget) {
      return
    }

    setSubmitting(true)
    try {
      await processApplication(processTarget.id, processAction, {
        comment: values.comment?.trim() || null,
      })
      message.success(processAction === 'approve' ? '审批已同意' : '审批已驳回')
      closeModal()
    } catch (requestError) {
      message.error(getErrorMessage(requestError, '审批处理失败'))
    } finally {
      setSubmitting(false)
    }
  }

  const todoColumns: TableProps<FlowApplication>['columns'] = [
    {
      title: '申请单',
      dataIndex: 'applicationNo',
      key: 'applicationNo',
      width: 190,
      render: (applicationNo: string, application) => (
        <div className="flow-primary-cell">
          <Typography.Text strong>{applicationNo}</Typography.Text>
          <ApplicationTypeTag type={application.applicationType} />
        </div>
      ),
    },
    {
      title: '申请人',
      dataIndex: 'applicantId',
      key: 'applicantId',
      width: 100,
      render: (applicantId: number) => `员工 ${applicantId}`,
    },
    {
      title: '申请时间',
      key: 'timeRange',
      width: 250,
      render: (_, application) => (
        <div className="flow-time-cell">
          <Typography.Text>{formatDateTime(application.startTime)}</Typography.Text>
          <Typography.Text type="secondary">至 {formatDateTime(application.endTime)}</Typography.Text>
        </div>
      ),
    },
    {
      title: '申请原因',
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: true,
    },
    {
      title: '提交时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 170,
      render: formatDateTime,
    },
  ]

  if (canProcess) {
    todoColumns.push({
      title: '审批操作',
      key: 'actions',
      fixed: 'right',
      width: 170,
      render: (_, application) => (
        <Space size={5}>
          <Button
            type="text"
            size="small"
            className="flow-approve-button"
            icon={<CheckOutlined />}
            onClick={() => openProcessModal(application, 'approve')}
          >
            同意
          </Button>
          <Button
            type="text"
            size="small"
            danger
            icon={<CloseOutlined />}
            onClick={() => openProcessModal(application, 'reject')}
          >
            驳回
          </Button>
        </Space>
      ),
    })
  }

  const doneColumns: TableProps<ApprovalTask>['columns'] = [
    {
      title: '申请单号',
      dataIndex: 'applicationNo',
      key: 'applicationNo',
      width: 190,
      render: (applicationNo: string, task) => (
        <div className="flow-primary-cell">
          <Typography.Text strong>{applicationNo}</Typography.Text>
          <ApplicationTypeTag type={task.applicationType} />
        </div>
      ),
    },
    {
      title: '申请人',
      dataIndex: 'applicantId',
      key: 'applicantId',
      width: 110,
      render: (applicantId: number) => `员工 ${applicantId}`,
    },
    {
      title: '处理结果',
      dataIndex: 'action',
      key: 'action',
      width: 110,
      render: (action: ApprovalTask['action']) => <ApprovalActionTag action={action} />,
    },
    {
      title: '审批意见',
      dataIndex: 'comment',
      key: 'comment',
      render: (comment: string | null) => comment || <Typography.Text type="secondary">未填写</Typography.Text>,
    },
    {
      title: '处理时间',
      dataIndex: 'processedAt',
      key: 'processedAt',
      width: 180,
      render: formatDateTime,
    },
  ]

  const approvedCount = done.filter((task) => task.action === 'APPROVE').length
  const rejectedCount = done.filter((task) => task.action === 'REJECT').length

  return (
    <section className="flow-page">
      <PageHeader
        eyebrow="WORKFLOW / APPROVALS"
        title="审批中心"
        description="处理直属员工提交的请假与加班申请，并查看个人已办审批记录。"
        extra={<Button icon={<ReloadOutlined />} loading={loading} onClick={() => void reload()}>刷新任务</Button>}
      />

      <Row gutter={[14, 14]} className="flow-stats">
        <Col xs={24} sm={8}>
          <Card bordered={false}><Statistic title="待我审批" value={todo.length} suffix="单" prefix={<ClockCircleOutlined />} /></Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false}><Statistic title="已同意" value={approvedCount} suffix="单" prefix={<CheckOutlined />} /></Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false}><Statistic title="已驳回" value={rejectedCount} suffix="单" prefix={<CloseOutlined />} /></Card>
        </Col>
      </Row>

      {error && (
        <Alert
          className="flow-alert"
          type="warning"
          showIcon
          message="审批任务暂时无法加载"
          description={getErrorMessage(error, '请稍后重试')}
          action={<Button size="small" icon={<ReloadOutlined />} onClick={() => void reload()}>重新加载</Button>}
        />
      )}

      <Card bordered={false} className="flow-table-card flow-approval-card">
        <Tabs
          items={[
            {
              key: 'todo',
              label: `待办审批 · ${todo.length}`,
              children: (
                <Table<FlowApplication>
                  rowKey="id"
                  columns={todoColumns}
                  dataSource={todo}
                  loading={loading}
                  pagination={{ pageSize: 10, showTotal: (total) => `共 ${total} 条待办` }}
                  scroll={{ x: 980 }}
                />
              ),
            },
            {
              key: 'done',
              label: `已办记录 · ${done.length}`,
              children: (
                <Table<ApprovalTask>
                  rowKey={(task) => `${task.applicationId}-${task.processedAt}`}
                  columns={doneColumns}
                  dataSource={done}
                  loading={loading}
                  pagination={{ pageSize: 10, showTotal: (total) => `共 ${total} 条已办` }}
                  scroll={{ x: 850 }}
                />
              ),
            },
          ]}
        />
      </Card>

      <Modal
        title={`${processAction === 'approve' ? '同意' : '驳回'}申请${processTarget ? ` · ${processTarget.applicationNo}` : ''}`}
        open={modalOpen}
        onCancel={closeModal}
        footer={null}
        width={580}
      >
        <Form<ApprovalRequest> form={form} layout="vertical" onFinish={handleProcess} requiredMark="optional">
          <Alert
            type={processAction === 'approve' ? 'info' : 'warning'}
            showIcon
            message={processAction === 'approve' ? '确认同意该申请' : '确认驳回该申请'}
            description="提交后该单据将进入终态，不能重复审批。"
          />
          <Form.Item
            className="flow-comment-field"
            label="审批意见"
            name="comment"
            rules={[{ max: 500, message: '审批意见不能超过 500 个字符' }]}
          >
            <Input.TextArea rows={4} maxLength={500} showCount placeholder="可填写处理说明" />
          </Form.Item>
          <div className="flow-form-actions">
            <Button onClick={closeModal}>取消</Button>
            <Button type={processAction === 'approve' ? 'primary' : 'default'} danger={processAction === 'reject'} htmlType="submit" loading={submitting}>
              确认{processAction === 'approve' ? '同意' : '驳回'}
            </Button>
          </div>
        </Form>
      </Modal>
    </section>
  )
})
