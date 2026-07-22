import {
  Alert,
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Typography,
  message,
} from 'antd'
import type { TableColumnsType } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { isApiClientError } from '../../api/core'
import { rbacApi } from '../../api/user/rbac'
import type { MenuPermission, MenuPermissionRequest } from '../../types/rbac'
import type { RecordStatus } from '../../types/organization'

const { Title } = Typography

type MenuFormValues = MenuPermissionRequest

const statusOptions: Array<{ label: string; value: RecordStatus }> = [
  { label: '启用', value: 'enabled' },
  { label: '停用', value: 'disabled' },
]

const getErrorMessage = (error: unknown) =>
  isApiClientError(error) ? error.message : '操作失败，请稍后重试'

const Menus = () => {
  const [editingMenu, setEditingMenu] = useState<MenuPermission | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [menus, setMenus] = useState<MenuPermission[]>([])
  const [form] = Form.useForm<MenuFormValues>()

  const loadMenus = async () => {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      setMenus(await rbacApi.listMenus())
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadMenus()
    }, 0)

    return () => {
      window.clearTimeout(timer)
    }
  }, [])

  const parentOptions = useMemo(
    () =>
      menus
        .filter((menu) => menu.id !== editingMenu?.id)
        .map((menu) => ({
          label: menu.title,
          value: menu.id,
        })),
    [editingMenu?.id, menus],
  )

  const openCreateModal = () => {
    setEditingMenu(null)
    form.setFieldsValue({
      code: '',
      component: '',
      parentId: undefined,
      path: '',
      permissionCode: '',
      sortOrder: 0,
      status: 'enabled',
      title: '',
    })
    setIsModalOpen(true)
  }

  const openEditModal = (menu: MenuPermission) => {
    setEditingMenu(menu)
    form.setFieldsValue({
      code: menu.code,
      component: menu.component,
      parentId: menu.parentId,
      path: menu.path,
      permissionCode: menu.permissionCode,
      sortOrder: menu.sortOrder,
      status: menu.status,
      title: menu.title,
    })
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    const values = await form.validateFields()
    setIsSubmitting(true)

    try {
      if (editingMenu) {
        await rbacApi.updateMenu(editingMenu.id, values)
        message.success('菜单已更新')
      } else {
        await rbacApi.createMenu(values)
        message.success('菜单已创建')
      }

      setIsModalOpen(false)
      await loadMenus()
    } catch (error) {
      message.error(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (menu: MenuPermission) => {
    try {
      await rbacApi.deleteMenu(menu.id)
      message.success('菜单已删除')
      await loadMenus()
    } catch (error) {
      message.error(getErrorMessage(error))
    }
  }

  const columns: TableColumnsType<MenuPermission> = [
    {
      dataIndex: 'title',
      title: '菜单名称',
    },
    {
      dataIndex: 'code',
      title: '菜单编码',
    },
    {
      dataIndex: 'path',
      title: '路由路径',
    },
    {
      dataIndex: 'permissionCode',
      title: '权限码',
      render: (value: string | undefined) => value || '-',
    },
    {
      dataIndex: 'sortOrder',
      title: '排序',
      width: 88,
    },
    {
      dataIndex: 'status',
      title: '状态',
      width: 88,
      render: (value: RecordStatus) => (value === 'enabled' ? '启用' : '停用'),
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
            title="确认删除该菜单？"
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
          菜单管理
        </Title>
        <Button type="primary" onClick={openCreateModal}>
          新增菜单
        </Button>
      </Space>
      {errorMessage ? <Alert showIcon type="error" message={errorMessage} style={{ marginBottom: 16 }} /> : null}
      <Table
        columns={columns}
        dataSource={menus}
        loading={isLoading}
        pagination={false}
        rowKey="id"
        scroll={{ x: 900 }}
      />
      <Modal
        title={editingMenu ? '编辑菜单' : '新增菜单'}
        open={isModalOpen}
        okText="保存"
        confirmLoading={isSubmitting}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSave}
      >
        <Form<MenuFormValues> form={form} layout="vertical">
          <Form.Item label="菜单名称" name="title" rules={[{ required: true, message: '请输入菜单名称' }]}>
            <Input maxLength={50} />
          </Form.Item>
          <Form.Item label="菜单编码" name="code" rules={[{ required: true, message: '请输入菜单编码' }]}>
            <Input maxLength={50} />
          </Form.Item>
          <Form.Item label="上级菜单" name="parentId">
            <Select allowClear options={parentOptions} placeholder="请选择上级菜单" />
          </Form.Item>
          <Form.Item label="路由路径" name="path" rules={[{ required: true, message: '请输入路由路径' }]}>
            <Input maxLength={120} />
          </Form.Item>
          <Form.Item label="组件路径" name="component">
            <Input maxLength={120} />
          </Form.Item>
          <Form.Item label="权限码" name="permissionCode">
            <Input maxLength={100} />
          </Form.Item>
          <Form.Item label="排序" name="sortOrder" rules={[{ required: true, message: '请输入排序值' }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="状态" name="status" rules={[{ required: true, message: '请选择状态' }]}>
            <Select options={statusOptions} />
          </Form.Item>
        </Form>
      </Modal>
    </section>
  )
}

export default Menus
