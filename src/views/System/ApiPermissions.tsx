import {
  Alert,
  Button,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Typography,
  message,
} from 'antd'
import type { TableColumnsType } from 'antd'
import { useEffect, useState } from 'react'
import { isApiClientError } from '../../api/core'
import { rbacApi } from '../../api/user/rbac'
import type { ApiPermission, ApiPermissionRequest, HttpMethod } from '../../types/rbac'
import type { RecordStatus } from '../../types/organization'

const { TextArea } = Input
const { Title } = Typography

type ApiPermissionFormValues = ApiPermissionRequest

const methodOptions: Array<{ label: HttpMethod; value: HttpMethod }> = [
  { label: 'GET', value: 'GET' },
  { label: 'POST', value: 'POST' },
  { label: 'PUT', value: 'PUT' },
  { label: 'DELETE', value: 'DELETE' },
  { label: 'PATCH', value: 'PATCH' },
]

const statusOptions: Array<{ label: string; value: RecordStatus }> = [
  { label: '启用', value: 'enabled' },
  { label: '停用', value: 'disabled' },
]

const getErrorMessage = (error: unknown) =>
  isApiClientError(error) ? error.message : '操作失败，请稍后重试'

const ApiPermissions = () => {
  const [apiPermissions, setApiPermissions] = useState<ApiPermission[]>([])
  const [editingApiPermission, setEditingApiPermission] = useState<ApiPermission | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form] = Form.useForm<ApiPermissionFormValues>()

  const loadApiPermissions = async () => {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      setApiPermissions(await rbacApi.listApiPermissions())
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadApiPermissions()
    }, 0)

    return () => {
      window.clearTimeout(timer)
    }
  }, [])

  const openCreateModal = () => {
    setEditingApiPermission(null)
    form.setFieldsValue({
      code: '',
      method: 'GET',
      name: '',
      path: '',
      remark: '',
      status: 'enabled',
    })
    setIsModalOpen(true)
  }

  const openEditModal = (apiPermission: ApiPermission) => {
    setEditingApiPermission(apiPermission)
    form.setFieldsValue({
      code: apiPermission.code,
      method: apiPermission.method,
      name: apiPermission.name,
      path: apiPermission.path,
      remark: apiPermission.remark,
      status: apiPermission.status,
    })
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    const values = await form.validateFields()
    setIsSubmitting(true)

    try {
      if (editingApiPermission) {
        await rbacApi.updateApiPermission(editingApiPermission.id, values)
        message.success('接口权限已更新')
      } else {
        await rbacApi.createApiPermission(values)
        message.success('接口权限已创建')
      }

      setIsModalOpen(false)
      await loadApiPermissions()
    } catch (error) {
      message.error(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (apiPermission: ApiPermission) => {
    try {
      await rbacApi.deleteApiPermission(apiPermission.id)
      message.success('接口权限已删除')
      await loadApiPermissions()
    } catch (error) {
      message.error(getErrorMessage(error))
    }
  }

  const columns: TableColumnsType<ApiPermission> = [
    {
      dataIndex: 'name',
      title: '权限名称',
    },
    {
      dataIndex: 'code',
      title: '权限码',
    },
    {
      dataIndex: 'method',
      title: '方法',
      width: 96,
    },
    {
      dataIndex: 'path',
      title: '接口路径',
    },
    {
      dataIndex: 'status',
      title: '状态',
      width: 88,
      render: (value: RecordStatus) => (value === 'enabled' ? '启用' : '停用'),
    },
    {
      dataIndex: 'remark',
      title: '备注',
      render: (value: string | undefined) => value || '-',
    },
    {
      key: 'actions',
      title: '操作',
      width: 160,
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => openEditModal(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确认删除该接口权限？"
            okText="删除"
            cancelText="取消"
            onConfirm={() => handleDelete(record)}
          >
            <Button danger type="link">
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <section>
      <Space style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>
          接口权限
        </Title>
        <Button type="primary" onClick={openCreateModal}>
          新增接口权限
        </Button>
      </Space>
      {errorMessage ? <Alert showIcon type="error" message={errorMessage} style={{ marginBottom: 16 }} /> : null}
      <Table
        columns={columns}
        dataSource={apiPermissions}
        loading={isLoading}
        pagination={false}
        rowKey="id"
        scroll={{ x: 900 }}
      />
      <Modal
        title={editingApiPermission ? '编辑接口权限' : '新增接口权限'}
        open={isModalOpen}
        okText="保存"
        confirmLoading={isSubmitting}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSave}
      >
        <Form<ApiPermissionFormValues> form={form} layout="vertical">
          <Form.Item label="权限名称" name="name" rules={[{ required: true, message: '请输入权限名称' }]}>
            <Input maxLength={50} />
          </Form.Item>
          <Form.Item label="权限码" name="code" rules={[{ required: true, message: '请输入权限码' }]}>
            <Input maxLength={100} />
          </Form.Item>
          <Form.Item label="HTTP 方法" name="method" rules={[{ required: true, message: '请选择 HTTP 方法' }]}>
            <Select options={methodOptions} />
          </Form.Item>
          <Form.Item label="接口路径" name="path" rules={[{ required: true, message: '请输入接口路径' }]}>
            <Input maxLength={160} />
          </Form.Item>
          <Form.Item label="状态" name="status" rules={[{ required: true, message: '请选择状态' }]}>
            <Select options={statusOptions} />
          </Form.Item>
          <Form.Item label="备注" name="remark">
            <TextArea maxLength={200} rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </section>
  )
}

export default ApiPermissions
