import { memo, useState } from 'react'
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import {
  App,
  Button,
  Col,
  Form,
  Input,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  type TableProps,
} from 'antd'
import { StatusTag } from '../../components/common/StatusTag.tsx'
import { useAuth } from '../../hooks/auth/useAuth.ts'
import type {
  ApiPermission,
  ApiPermissionRequest,
  HttpMethod,
} from '../../services/rbac/rbac.types.ts'
import { formatDateTime } from '../../utils/date.ts'
import { getErrorMessage } from '../../utils/error.ts'
import type { PermissionPanelProps } from './permission.types.ts'

const DEFAULT_VALUES: ApiPermissionRequest = {
  code: '',
  name: '',
  httpMethod: 'GET',
  pathPattern: '',
  status: 1,
}

const HTTP_METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: 'blue',
  POST: 'green',
  PUT: 'gold',
  DELETE: 'red',
  PATCH: 'purple',
}

export const ApiPermissionPanel = memo(function ApiPermissionPanel({
  controller,
}: PermissionPanelProps) {
  const [form] = Form.useForm<ApiPermissionRequest>()
  const [editingPermission, setEditingPermission] = useState<ApiPermission | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const { message } = App.useApp()
  const { hasAuthority } = useAuth()
  const {
    apiPermissions,
    loading,
    createApiPermission,
    updateApiPermission,
    deleteApiPermission,
  } = controller

  const canCreate = hasAuthority('POST:/api/user/**')
  const canUpdate = hasAuthority('PUT:/api/user/**')
  const canDelete = hasAuthority('DELETE:/api/user/**')

  const openCreateModal = () => {
    setEditingPermission(null)
    form.setFieldsValue(DEFAULT_VALUES)
    setModalOpen(true)
  }

  const openEditModal = (permission: ApiPermission) => {
    setEditingPermission(permission)
    form.setFieldsValue({
      code: permission.code,
      name: permission.name,
      httpMethod: permission.httpMethod,
      pathPattern: permission.pathPattern,
      status: permission.status,
    })
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingPermission(null)
    form.resetFields()
  }

  const handleSubmit = async (values: ApiPermissionRequest) => {
    setSubmitting(true)
    try {
      const payload: ApiPermissionRequest = {
        ...values,
        code: values.code.trim().toUpperCase(),
        name: values.name.trim(),
        httpMethod: values.httpMethod.toUpperCase() as HttpMethod,
        pathPattern: values.pathPattern.trim(),
      }
      if (editingPermission) {
        await updateApiPermission(editingPermission.id, payload)
        message.success('接口权限已更新')
      } else {
        await createApiPermission(payload)
        message.success('接口权限已创建')
      }
      closeModal()
    } catch (requestError) {
      message.error(getErrorMessage(requestError, '接口权限保存失败'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (permission: ApiPermission) => {
    try {
      await deleteApiPermission(permission.id)
      message.success(`已删除接口权限“${permission.name}”`)
    } catch (requestError) {
      message.error(getErrorMessage(requestError, '接口权限删除失败'))
    }
  }

  const columns: TableProps<ApiPermission>['columns'] = [
    {
      title: '权限名称',
      dataIndex: 'name',
      key: 'name',
      width: 210,
      render: (name: string, permission) => (
        <div className="permission-primary-cell">
          <Typography.Text strong>{name}</Typography.Text>
          <Tag bordered={false}>{permission.code}</Tag>
        </div>
      ),
    },
    {
      title: 'HTTP',
      dataIndex: 'httpMethod',
      key: 'httpMethod',
      width: 90,
      render: (method: HttpMethod) => <Tag color={METHOD_COLORS[method]}>{method}</Tag>,
    },
    {
      title: '路径模式',
      dataIndex: 'pathPattern',
      key: 'pathPattern',
      render: (pathPattern: string) => <Typography.Text code>{pathPattern}</Typography.Text>,
    },
    {
      title: 'Authority',
      dataIndex: 'authority',
      key: 'authority',
      ellipsis: true,
      render: (authority: string) => <Typography.Text type="secondary">{authority}</Typography.Text>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      render: (status: ApiPermission['status']) => <StatusTag status={status} />,
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
      fixed: 'right',
      width: 140,
      render: (_, permission) => (
        <Space size={3}>
          {canUpdate && (
            <Button type="text" size="small" icon={<EditOutlined />} onClick={() => openEditModal(permission)}>
              编辑
            </Button>
          )}
          {canDelete && (
            <Popconfirm
              title="删除该接口权限？"
              description="与角色的接口授权关系将同步解除。"
              okText="确认删除"
              cancelText="取消"
              onConfirm={() => handleDelete(permission)}
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

  return (
    <div className="permission-panel">
      <div className="permission-panel-toolbar">
        <div>
          <Typography.Title level={4}>接口权限目录</Typography.Title>
        </div>
        {canCreate && (
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
            新建接口权限
          </Button>
        )}
      </div>

      <Table<ApiPermission>
        rowKey="id"
        columns={columns}
        dataSource={apiPermissions}
        loading={loading}
        pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 项接口权限` }}
        scroll={{ x: 1120 }}
      />

      <Modal
        title={editingPermission ? '编辑接口权限' : '新建接口权限'}
        open={modalOpen}
        onCancel={closeModal}
        footer={null}
        width={680}
      >
        <Form<ApiPermissionRequest>
          form={form}
          layout="vertical"
          initialValues={DEFAULT_VALUES}
          onFinish={handleSubmit}
          requiredMark="optional"
        >
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="权限编码"
                name="code"
                rules={[
                  { required: true, whitespace: true, message: '请输入权限编码' },
                  { max: 100, message: '不能超过 100 个字符' },
                  { pattern: /^[A-Za-z0-9_]+$/, message: '仅支持字母、数字和下划线' },
                ]}
              >
                <Input placeholder="例如：EMPLOYEE_READ" maxLength={100} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="权限名称"
                name="name"
                rules={[
                  { required: true, whitespace: true, message: '请输入权限名称' },
                  { max: 100, message: '不能超过 100 个字符' },
                ]}
              >
                <Input placeholder="例如：查询员工" maxLength={100} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item label="HTTP Method" name="httpMethod" rules={[{ required: true }]}>
                <Select options={HTTP_METHODS.map((method) => ({ label: method, value: method }))} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={16}>
              <Form.Item
                label="接口路径模式"
                name="pathPattern"
                rules={[
                  { required: true, whitespace: true, message: '请输入接口路径模式' },
                  { max: 200, message: '不能超过 200 个字符' },
                ]}
              >
                <Input placeholder="例如：/api/user/**" maxLength={200} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="权限状态" name="status" rules={[{ required: true }]}>
            <Select options={[{ label: '启用', value: 1 }, { label: '停用', value: 0 }]} />
          </Form.Item>
          <div className="permission-form-actions">
            <Button onClick={closeModal}>取消</Button>
            <Button type="primary" htmlType="submit" loading={submitting}>
              {editingPermission ? '保存修改' : '创建接口权限'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  )
})
