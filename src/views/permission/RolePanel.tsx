import { memo, useRef, useState } from 'react'
import {
  DeleteOutlined,
  EditOutlined,
  KeyOutlined,
  PlusOutlined,
} from '@ant-design/icons'
import {
  Alert,
  App,
  Button,
  Checkbox,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  type TableProps,
} from 'antd'
import { StatusTag } from '../../components/common/StatusTag.tsx'
import { useAuth } from '../../hooks/auth/useAuth.ts'
import type { Role, RoleRequest } from '../../services/rbac/rbac.types.ts'
import { formatDateTime } from '../../utils/date.ts'
import { getErrorMessage } from '../../utils/error.ts'
import type { PermissionPanelProps } from './permission.types.ts'

const DEFAULT_VALUES: RoleRequest = {
  code: '',
  name: '',
  status: 1,
}

export const RolePanel = memo(function RolePanel({ controller }: PermissionPanelProps) {
  const [form] = Form.useForm<RoleRequest>()
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [grantTarget, setGrantTarget] = useState<Role | null>(null)
  const [grantModalOpen, setGrantModalOpen] = useState(false)
  const [selectedMenuIds, setSelectedMenuIds] = useState<number[]>([])
  const [selectedApiPermissionIds, setSelectedApiPermissionIds] = useState<number[]>([])
  const [overwriteConfirmed, setOverwriteConfirmed] = useState(false)
  const [grantLoading, setGrantLoading] = useState(false)
  const [grantLoadError, setGrantLoadError] = useState<unknown>(null)
  const [grantSubmitting, setGrantSubmitting] = useState(false)
  const grantRequestIdRef = useRef(0)
  const { message } = App.useApp()
  const { hasAuthority } = useAuth()
  const {
    roles,
    menus,
    apiPermissions,
    loading,
    createRole,
    updateRole,
    deleteRole,
    getRolePermissions,
    assignRolePermissions,
  } = controller

  const canCreate = hasAuthority('POST:/api/user/**')
  const canUpdate = hasAuthority('PUT:/api/user/**')
  const canDelete = hasAuthority('DELETE:/api/user/**')

  const openCreateModal = () => {
    setEditingRole(null)
    form.setFieldsValue(DEFAULT_VALUES)
    setModalOpen(true)
  }

  const openEditModal = (role: Role) => {
    setEditingRole(role)
    form.setFieldsValue({ code: role.code, name: role.name, status: role.status })
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingRole(null)
    form.resetFields()
  }

  const handleSubmit = async (values: RoleRequest) => {
    setSubmitting(true)
    try {
      const payload: RoleRequest = {
        ...values,
        code: values.code.trim().toUpperCase(),
        name: values.name.trim(),
      }
      if (editingRole) {
        await updateRole(editingRole.id, payload)
        message.success('角色信息已更新')
      } else {
        await createRole(payload)
        message.success('角色已创建')
      }
      closeModal()
    } catch (requestError) {
      message.error(getErrorMessage(requestError, '角色保存失败'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (role: Role) => {
    try {
      await deleteRole(role.id)
      message.success(`已删除角色“${role.name}”`)
    } catch (requestError) {
      message.error(getErrorMessage(requestError, '角色删除失败'))
    }
  }

  const openGrantModal = async (role: Role) => {
    const requestId = grantRequestIdRef.current + 1
    grantRequestIdRef.current = requestId
    setGrantTarget(role)
    setSelectedMenuIds([])
    setSelectedApiPermissionIds([])
    setOverwriteConfirmed(false)
    setGrantLoading(true)
    setGrantLoadError(null)
    setGrantModalOpen(true)

    try {
      const currentGrant = await getRolePermissions(role.id)
      if (grantRequestIdRef.current !== requestId) {
        return
      }
      setSelectedMenuIds(currentGrant.menuIds)
      setSelectedApiPermissionIds(currentGrant.apiPermissionIds)
    } catch (requestError) {
      if (grantRequestIdRef.current === requestId) {
        setGrantLoadError(requestError)
      }
    } finally {
      if (grantRequestIdRef.current === requestId) {
        setGrantLoading(false)
      }
    }
  }

  const closeGrantModal = () => {
    grantRequestIdRef.current += 1
    setGrantModalOpen(false)
    setGrantTarget(null)
    setSelectedMenuIds([])
    setSelectedApiPermissionIds([])
    setOverwriteConfirmed(false)
    setGrantLoading(false)
    setGrantLoadError(null)
  }

  const handleGrant = async () => {
    if (!grantTarget || !overwriteConfirmed || grantLoading || grantLoadError) {
      return
    }

    setGrantSubmitting(true)
    try {
      await assignRolePermissions(grantTarget.id, {
        menuIds: selectedMenuIds,
        apiPermissionIds: selectedApiPermissionIds,
      })
      message.success(`已覆盖保存“${grantTarget.name}”的权限`)
      closeGrantModal()
    } catch (requestError) {
      message.error(getErrorMessage(requestError, '角色授权保存失败'))
    } finally {
      setGrantSubmitting(false)
    }
  }

  const columns: TableProps<Role>['columns'] = [
    {
      title: '角色',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, role) => (
        <div className="permission-primary-cell">
          <Typography.Text strong>{name}</Typography.Text>
          <Tag bordered={false}>{role.code}</Tag>
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: Role['status']) => <StatusTag status={status} />,
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 180,
      render: formatDateTime,
    },
  ]

  if (canUpdate || canDelete) {
    columns.push({
      title: '操作',
      key: 'actions',
      width: 220,
      render: (_, role) => (
        <Space size={3}>
          {canUpdate && (
            <Button type="text" size="small" icon={<EditOutlined />} onClick={() => openEditModal(role)}>
              编辑
            </Button>
          )}
          {canUpdate && (
            <Button type="text" size="small" icon={<KeyOutlined />} onClick={() => void openGrantModal(role)}>
              授权
            </Button>
          )}
          {canDelete && (
            <Popconfirm
              title="删除该角色？"
              description="角色与员工、菜单和接口权限的关联将一并解除。"
              okText="确认删除"
              cancelText="取消"
              onConfirm={() => handleDelete(role)}
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
          <Typography.Title level={4}>角色目录</Typography.Title>
        </div>
        {canCreate && (
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
            新建角色
          </Button>
        )}
      </div>

      <Table<Role>
        rowKey="id"
        columns={columns}
        dataSource={roles}
        loading={loading}
        pagination={{ pageSize: 8, showTotal: (total) => `共 ${total} 个角色` }}
        scroll={{ x: 680 }}
      />

      <Modal
        title={editingRole ? '编辑角色' : '新建角色'}
        open={modalOpen}
        onCancel={closeModal}
        footer={null}
        width={560}
      >
        <Form<RoleRequest>
          form={form}
          layout="vertical"
          initialValues={DEFAULT_VALUES}
          onFinish={handleSubmit}
          requiredMark="optional"
        >
          <Form.Item
            label="角色编码"
            name="code"
            rules={[
              { required: true, whitespace: true, message: '请输入角色编码' },
              { max: 50, message: '不能超过 50 个字符' },
              { pattern: /^[A-Za-z0-9_]+$/, message: '仅支持字母、数字和下划线' },
            ]}
          >
            <Input placeholder="例如：DEPARTMENT_MANAGER" maxLength={50} />
          </Form.Item>
          <Form.Item
            label="角色名称"
            name="name"
            rules={[
              { required: true, whitespace: true, message: '请输入角色名称' },
              { max: 100, message: '不能超过 100 个字符' },
            ]}
          >
            <Input placeholder="例如：部门主管" maxLength={100} />
          </Form.Item>
          <Form.Item label="角色状态" name="status" rules={[{ required: true }]}>
            <Select options={[{ label: '启用', value: 1 }, { label: '停用', value: 0 }]} />
          </Form.Item>
          <div className="permission-form-actions">
            <Button onClick={closeModal}>取消</Button>
            <Button type="primary" htmlType="submit" loading={submitting}>
              {editingRole ? '保存修改' : '创建角色'}
            </Button>
          </div>
        </Form>
      </Modal>

      <Modal
        title={`覆盖角色授权${grantTarget ? ` · ${grantTarget.name}` : ''}`}
        open={grantModalOpen}
        onCancel={closeGrantModal}
        okText="覆盖保存"
        cancelText="取消"
        confirmLoading={grantSubmitting}
        okButtonProps={{ disabled: grantLoading || Boolean(grantLoadError) || !overwriteConfirmed }}
        onOk={() => void handleGrant()}
        width={680}
      >
        <div className="permission-grant-form">
          <div>
            <Typography.Text strong>菜单权限</Typography.Text>
            <Select
              mode="multiple"
              allowClear
              showSearch
              optionFilterProp="label"
              loading={grantLoading}
              disabled={grantLoading || Boolean(grantLoadError)}
              value={selectedMenuIds}
              onChange={setSelectedMenuIds}
              options={menus.map((menuItem) => ({
                label: `${menuItem.name} · ${menuItem.type}`,
                value: menuItem.id,
                disabled: menuItem.status === 0,
              }))}
              placeholder="选择允许访问的菜单"
            />
          </div>
          <div>
            <Typography.Text strong>接口权限</Typography.Text>
            <Select
              mode="multiple"
              allowClear
              showSearch
              optionFilterProp="label"
              loading={grantLoading}
              disabled={grantLoading || Boolean(grantLoadError)}
              value={selectedApiPermissionIds}
              onChange={setSelectedApiPermissionIds}
              options={apiPermissions.map((permission) => ({
                label: `${permission.name} · ${permission.authority}`,
                value: permission.id,
                disabled: permission.status === 0,
              }))}
              placeholder="选择允许调用的接口"
            />
          </div>
          <Checkbox
            checked={overwriteConfirmed}
            disabled={grantLoading || Boolean(grantLoadError)}
            onChange={(event) => setOverwriteConfirmed(event.target.checked)}
          >
            我已确认以当前选择覆盖该角色全部权限
          </Checkbox>
        </div>
      </Modal>
    </div>
  )
})
