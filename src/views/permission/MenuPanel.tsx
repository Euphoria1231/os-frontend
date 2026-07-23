import { memo, useMemo, useState } from 'react'
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import {
  App,
  Button,
  Col,
  Form,
  Input,
  InputNumber,
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
  MenuPermission,
  MenuPermissionRequest,
  MenuType,
} from '../../services/rbac/rbac.types.ts'
import { getErrorMessage } from '../../utils/error.ts'
import type { PermissionPanelProps } from './permission.types.ts'

const DEFAULT_VALUES: MenuPermissionRequest = {
  parentId: 0,
  name: '',
  path: null,
  component: null,
  permission: null,
  type: 'MENU',
  sortOrder: 0,
  status: 1,
}

const MENU_TYPE_LABELS: Record<MenuType, string> = {
  DIRECTORY: '目录',
  MENU: '菜单',
  BUTTON: '按钮',
}

function normalizeOptional(value: string | null | undefined): string | null {
  return value?.trim() || null
}

export const MenuPanel = memo(function MenuPanel({ controller }: PermissionPanelProps) {
  const [form] = Form.useForm<MenuPermissionRequest>()
  const [editingMenu, setEditingMenu] = useState<MenuPermission | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const { message } = App.useApp()
  const { hasAuthority } = useAuth()
  const { menus, loading, createMenu, updateMenu, deleteMenu } = controller

  const canCreate = hasAuthority('POST:/api/user/**')
  const canUpdate = hasAuthority('PUT:/api/user/**')
  const canDelete = hasAuthority('DELETE:/api/user/**')
  const menuNames = useMemo(
    () => new Map(menus.map((menuItem) => [menuItem.id, menuItem.name])),
    [menus],
  )
  const parentOptions = useMemo(
    () => [
      { label: '顶级菜单', value: 0 },
      ...menus
        .filter((menuItem) => menuItem.id !== editingMenu?.id && menuItem.type !== 'BUTTON')
        .map((menuItem) => ({ label: menuItem.name, value: menuItem.id })),
    ],
    [editingMenu?.id, menus],
  )

  const openCreateModal = () => {
    setEditingMenu(null)
    form.setFieldsValue(DEFAULT_VALUES)
    setModalOpen(true)
  }

  const openEditModal = (menuItem: MenuPermission) => {
    setEditingMenu(menuItem)
    form.setFieldsValue({
      parentId: menuItem.parentId,
      name: menuItem.name,
      path: menuItem.path,
      component: menuItem.component,
      permission: menuItem.permission,
      type: menuItem.type,
      sortOrder: menuItem.sortOrder,
      status: menuItem.status,
    })
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingMenu(null)
    form.resetFields()
  }

  const handleSubmit = async (values: MenuPermissionRequest) => {
    setSubmitting(true)
    try {
      const payload: MenuPermissionRequest = {
        ...values,
        name: values.name.trim(),
        path: normalizeOptional(values.path),
        component: normalizeOptional(values.component),
        permission: normalizeOptional(values.permission),
      }
      if (editingMenu) {
        await updateMenu(editingMenu.id, payload)
        message.success('菜单权限已更新')
      } else {
        await createMenu(payload)
        message.success('菜单权限已创建')
      }
      closeModal()
    } catch (requestError) {
      message.error(getErrorMessage(requestError, '菜单权限保存失败'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (menuItem: MenuPermission) => {
    try {
      await deleteMenu(menuItem.id)
      message.success(`已删除菜单“${menuItem.name}”`)
    } catch (requestError) {
      message.error(getErrorMessage(requestError, '菜单权限删除失败'))
    }
  }

  const columns: TableProps<MenuPermission>['columns'] = [
    {
      title: '菜单名称',
      dataIndex: 'name',
      key: 'name',
      width: 190,
      render: (name: string, menuItem) => (
        <div className="permission-primary-cell">
          <Typography.Text strong>{name}</Typography.Text>
          <Typography.Text type="secondary">
            {menuItem.parentId === 0 ? '顶级菜单' : menuNames.get(menuItem.parentId) ?? `父级 ${menuItem.parentId}`}
          </Typography.Text>
        </div>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 90,
      render: (type: MenuType) => <Tag color={type === 'BUTTON' ? 'gold' : type === 'DIRECTORY' ? 'blue' : 'cyan'}>{MENU_TYPE_LABELS[type]}</Tag>,
    },
    {
      title: '路由 / 权限标识',
      key: 'route',
      render: (_, menuItem) => (
        <div className="permission-code-cell">
          <Typography.Text code>{menuItem.path || '—'}</Typography.Text>
          <Typography.Text type="secondary">{menuItem.permission || '未配置权限标识'}</Typography.Text>
        </div>
      ),
    },
    {
      title: '组件',
      dataIndex: 'component',
      key: 'component',
      ellipsis: true,
      render: (component: string | null) => component || <Typography.Text type="secondary">—</Typography.Text>,
    },
    {
      title: '排序',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 76,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      render: (status: MenuPermission['status']) => <StatusTag status={status} />,
    },
  ]

  if (canUpdate || canDelete) {
    columns.push({
      title: '操作',
      key: 'actions',
      fixed: 'right',
      width: 140,
      render: (_, menuItem) => (
        <Space size={3}>
          {canUpdate && (
            <Button type="text" size="small" icon={<EditOutlined />} onClick={() => openEditModal(menuItem)}>
              编辑
            </Button>
          )}
          {canDelete && (
            <Popconfirm
              title="删除该菜单？"
              description="与角色的菜单授权关系将同步解除。"
              okText="确认删除"
              cancelText="取消"
              onConfirm={() => handleDelete(menuItem)}
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
          <Typography.Title level={4}>菜单权限目录</Typography.Title>
        </div>
        {canCreate && (
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
            新建菜单
          </Button>
        )}
      </div>

      <Table<MenuPermission>
        rowKey="id"
        columns={columns}
        dataSource={menus}
        loading={loading}
        pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 项菜单权限` }}
        scroll={{ x: 1050 }}
      />

      <Modal
        title={editingMenu ? '编辑菜单权限' : '新建菜单权限'}
        open={modalOpen}
        onCancel={closeModal}
        footer={null}
        width={720}
      >
        <Form<MenuPermissionRequest>
          form={form}
          layout="vertical"
          initialValues={DEFAULT_VALUES}
          onFinish={handleSubmit}
          requiredMark="optional"
        >
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="菜单名称"
                name="name"
                rules={[
                  { required: true, whitespace: true, message: '请输入菜单名称' },
                  { max: 100, message: '不能超过 100 个字符' },
                ]}
              >
                <Input placeholder="例如：员工管理" maxLength={100} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="上级菜单" name="parentId" rules={[{ required: true }]}>
                <Select showSearch optionFilterProp="label" options={parentOptions} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item label="菜单类型" name="type" rules={[{ required: true }]}>
                <Select options={Object.entries(MENU_TYPE_LABELS).map(([value, label]) => ({ value, label }))} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item label="显示顺序" name="sortOrder" rules={[{ required: true }]}>
                <InputNumber min={0} precision={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item label="状态" name="status" rules={[{ required: true }]}>
                <Select options={[{ label: '启用', value: 1 }, { label: '停用', value: 0 }]} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="路由地址" name="path" rules={[{ max: 200, message: '不能超过 200 个字符' }]}>
            <Input placeholder="例如：/employees" maxLength={200} />
          </Form.Item>
          <Form.Item label="组件名称" name="component" rules={[{ max: 200, message: '不能超过 200 个字符' }]}>
            <Input placeholder="例如：EmployeePage" maxLength={200} />
          </Form.Item>
          <Form.Item label="权限标识" name="permission" rules={[{ max: 100, message: '不能超过 100 个字符' }]}>
            <Input placeholder="例如：employee:read" maxLength={100} />
          </Form.Item>
          <div className="permission-form-actions">
            <Button onClick={closeModal}>取消</Button>
            <Button type="primary" htmlType="submit" loading={submitting}>
              {editingMenu ? '保存修改' : '创建菜单'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  )
})
