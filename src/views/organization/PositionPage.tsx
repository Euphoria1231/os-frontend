import { memo, useState } from 'react'
import {
  DeleteOutlined,
  EditOutlined,
  IdcardOutlined,
  PlusOutlined,
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
  Popconfirm,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
  type TableProps,
} from 'antd'
import { PageHeader } from '../../components/common/PageHeader.tsx'
import { StatusTag } from '../../components/common/StatusTag.tsx'
import { useAuth } from '../../hooks/auth/useAuth.ts'
import { usePositions } from '../../hooks/organization/usePositions.ts'
import type {
  Position,
  PositionRequest,
} from '../../services/organization/organization.types.ts'
import { formatDateTime } from '../../utils/date.ts'
import { getErrorMessage } from '../../utils/error.ts'
import './OrganizationPage.less'

const DEFAULT_VALUES: PositionRequest = {
  code: '',
  name: '',
  description: null,
  status: 1,
}

export const PositionPage = memo(function PositionPage() {
  const [form] = Form.useForm<PositionRequest>()
  const [editingPosition, setEditingPosition] = useState<Position | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const { message } = App.useApp()
  const { hasAuthority } = useAuth()
  const {
    positions,
    loading,
    error,
    reload,
    createPosition,
    updatePosition,
    deletePosition,
  } = usePositions()

  const canCreate = hasAuthority('POST:/api/user/**')
  const canUpdate = hasAuthority('PUT:/api/user/**')
  const canDelete = hasAuthority('DELETE:/api/user/**')

  const openCreateModal = () => {
    setEditingPosition(null)
    form.setFieldsValue(DEFAULT_VALUES)
    setModalOpen(true)
  }

  const openEditModal = (position: Position) => {
    setEditingPosition(position)
    form.setFieldsValue({
      code: position.code,
      name: position.name,
      description: position.description,
      status: position.status,
    })
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingPosition(null)
    form.resetFields()
  }

  const handleSubmit = async (values: PositionRequest) => {
    setSubmitting(true)
    try {
      const payload: PositionRequest = {
        ...values,
        code: values.code.trim().toUpperCase(),
        name: values.name.trim(),
        description: values.description?.trim() || null,
      }

      if (editingPosition) {
        await updatePosition(editingPosition.id, payload)
        message.success('岗位信息已更新')
      } else {
        await createPosition(payload)
        message.success('岗位已创建')
      }
      closeModal()
    } catch (requestError) {
      message.error(getErrorMessage(requestError, '岗位信息保存失败'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (position: Position) => {
    try {
      await deletePosition(position.id)
      message.success(`已删除岗位“${position.name}”`)
    } catch (requestError) {
      message.error(getErrorMessage(requestError, '岗位删除失败'))
    }
  }

  const columns: TableProps<Position>['columns'] = [
    {
      title: '岗位信息',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, position) => (
        <Space size={10}>
          <span className="organization-row-icon position-tone">
            <IdcardOutlined />
          </span>
          <div className="organization-primary-cell">
            <Typography.Text strong>{name}</Typography.Text>
            <Tag bordered={false}>{position.code}</Tag>
          </div>
        </Space>
      ),
    },
    {
      title: '岗位说明',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (description: string | null) =>
        description || <Typography.Text type="secondary">暂无说明</Typography.Text>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      render: (status: Position['status']) => <StatusTag status={status} />,
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 170,
      render: formatDateTime,
    },
  ]

  if (canUpdate || canDelete) {
    columns.push({
      title: '操作',
      key: 'actions',
      width: 136,
      fixed: 'right',
      render: (_, position) => (
        <Space size={4}>
          {canUpdate && (
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => openEditModal(position)}
            >
              编辑
            </Button>
          )}
          {canDelete && (
            <Popconfirm
              title="删除该岗位？"
              description="存在关联员工时，后端将拒绝删除。"
              okText="确认删除"
              cancelText="取消"
              onConfirm={() => handleDelete(position)}
            >
              <Button type="text" size="small" danger icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    })
  }

  const activeCount = positions.filter((position) => position.status === 1).length
  const disabledCount = positions.length - activeCount

  return (
    <section className="organization-page">
      <PageHeader
        eyebrow="ORGANIZATION / POSITIONS"
        title="岗位管理"
        description="统一维护岗位编码、岗位说明与启停状态，为员工任职和权限分配提供标准依据。"
        extra={
          canCreate ? (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
              新建岗位
            </Button>
          ) : null
        }
      />

      <Row gutter={[14, 14]} className="organization-stats">
        <Col xs={24} sm={8}>
          <Card bordered={false}>
            <Statistic title="岗位总数" value={positions.length} suffix="个" />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false}>
            <Statistic title="正常启用" value={activeCount} suffix="个" />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false}>
            <Statistic title="已停用" value={disabledCount} suffix="个" />
          </Card>
        </Col>
      </Row>

      {error && (
        <Alert
          className="organization-alert"
          type="warning"
          showIcon
          message="岗位数据暂时无法加载"
          description={getErrorMessage(error, '请稍后重试')}
          action={
            <Button size="small" icon={<ReloadOutlined />} onClick={() => void reload()}>
              重新加载
            </Button>
          }
        />
      )}

      <Card bordered={false} className="organization-table-card">
        <div className="organization-table-heading">
          <div>
            <Typography.Title level={4}>岗位目录</Typography.Title>
            <Typography.Text type="secondary">岗位编码提交时统一转换为大写</Typography.Text>
          </div>
          <Button
            type="text"
            icon={<ReloadOutlined />}
            loading={loading}
            onClick={() => void reload()}
          >
            刷新
          </Button>
        </div>
        <Table<Position>
          rowKey="id"
          columns={columns}
          dataSource={positions}
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 个岗位` }}
          scroll={{ x: 820 }}
        />
      </Card>

      <Modal
        title={editingPosition ? '编辑岗位' : '新建岗位'}
        open={modalOpen}
        onCancel={closeModal}
        footer={null}
        width={620}
      >
        <Form<PositionRequest>
          form={form}
          layout="vertical"
          initialValues={DEFAULT_VALUES}
          onFinish={handleSubmit}
          requiredMark="optional"
        >
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="岗位编码"
                name="code"
                rules={[
                  { required: true, whitespace: true, message: '请输入岗位编码' },
                  { max: 50, message: '岗位编码不能超过 50 个字符' },
                  { pattern: /^[A-Za-z0-9_]+$/, message: '仅支持字母、数字和下划线' },
                ]}
              >
                <Input placeholder="例如：PRODUCT_MANAGER" maxLength={50} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="岗位名称"
                name="name"
                rules={[
                  { required: true, whitespace: true, message: '请输入岗位名称' },
                  { max: 100, message: '岗位名称不能超过 100 个字符' },
                ]}
              >
                <Input placeholder="例如：产品经理" maxLength={100} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label="岗位说明"
            name="description"
            rules={[{ max: 500, message: '岗位说明不能超过 500 个字符' }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="简要说明岗位职责与适用范围"
              maxLength={500}
              showCount
            />
          </Form.Item>
          <Form.Item label="岗位状态" name="status" rules={[{ required: true }]}>
            <Select
              options={[
                { label: '启用', value: 1 },
                { label: '停用', value: 0 },
              ]}
            />
          </Form.Item>
          <div className="organization-form-actions">
            <Button onClick={closeModal}>取消</Button>
            <Button type="primary" htmlType="submit" loading={submitting}>
              {editingPosition ? '保存修改' : '创建岗位'}
            </Button>
          </div>
        </Form>
      </Modal>
    </section>
  )
})
