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
  Tree,
  Typography,
  message,
} from 'antd'
import type { TableColumnsType } from 'antd'
import type { Key } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { isApiClientError } from '../../api/core'
import { rbacApi } from '../../api/user/rbac'
import type { ApiPermission, MenuPermission, Role, RoleRequest } from '../../types/rbac'
import type { RecordStatus } from '../../types/organization'

const { TextArea } = Input
const { Title } = Typography

type RoleFormValues = RoleRequest

interface MenuTreeNode {
  title: string
  key: string
  children?: MenuTreeNode[]
}

const statusOptions: Array<{ label: string; value: RecordStatus }> = [
  { label: '启用', value: 'enabled' },
  { label: '停用', value: 'disabled' },
]

const getErrorMessage = (error: unknown) =>
  isApiClientError(error) ? error.message : '操作失败，请稍后重试'

const buildMenuTree = (menus: MenuPermission[]): MenuTreeNode[] => {
  const menuNodeMap = new Map<string, MenuTreeNode>()
  const roots: MenuTreeNode[] = []

  menus
    .slice()
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .forEach((menu) => {
      menuNodeMap.set(menu.id, {
        key: menu.id,
        title: menu.title,
      })
    })

  menus.forEach((menu) => {
    const node = menuNodeMap.get(menu.id)

    if (!node) {
      return
    }

    if (menu.parentId && menuNodeMap.has(menu.parentId)) {
      const parent = menuNodeMap.get(menu.parentId)
      if (parent?.children) {
        parent.children.push(node)
      } else if (parent) {
        parent.children = [node]
      }
      return
    }

    roots.push(node)
  })

  return roots
}

const Roles = () => {
  const [apiPermissions, setApiPermissions] = useState<ApiPermission[]>([])
  const [checkedMenuIds, setCheckedMenuIds] = useState<Key[]>([])
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [menus, setMenus] = useState<MenuPermission[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [roleForm] = Form.useForm<RoleFormValues>()
  const [authForm] = Form.useForm<{ apiPermissionIds: string[] }>()

  const apiPermissionOptions = apiPermissions.map((permission) => ({
    label: `${permission.method} ${permission.path}`,
    value: permission.id,
  }))

  const menuTreeData = useMemo(() => buildMenuTree(menus), [menus])

  const loadPageData = async () => {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const [roleList, menuList, apiPermissionList] = await Promise.all([
        rbacApi.listRoles(),
        rbacApi.listMenus(),
        rbacApi.listApiPermissions(),
      ])
      setRoles(roleList)
      setMenus(menuList)
      setApiPermissions(apiPermissionList)
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadPageData()
    }, 0)

    return () => {
      window.clearTimeout(timer)
    }
  }, [])

  const openCreateModal = () => {
    setEditingRole(null)
    roleForm.setFieldsValue({
      code: '',
      name: '',
      remark: '',
      status: 'enabled',
    })
    setIsRoleModalOpen(true)
  }

  const openEditModal = (role: Role) => {
    setEditingRole(role)
    roleForm.setFieldsValue({
      code: role.code,
      name: role.name,
      remark: role.remark,
      status: role.status,
    })
    setIsRoleModalOpen(true)
  }

  const openAuthModal = (role: Role) => {
    setSelectedRole(role)
    setCheckedMenuIds(role.menuIds ?? [])
    authForm.setFieldsValue({
      apiPermissionIds: role.apiPermissionIds ?? [],
    })
    setIsAuthModalOpen(true)
  }

  const handleSaveRole = async () => {
    const values = await roleForm.validateFields()
    setIsSubmitting(true)

    try {
      if (editingRole) {
        await rbacApi.updateRole(editingRole.id, values)
        message.success('角色已更新')
      } else {
        await rbacApi.createRole(values)
        message.success('角色已创建')
      }

      setIsRoleModalOpen(false)
      await loadPageData()
    } catch (error) {
      message.error(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (role: Role) => {
    try {
      await rbacApi.deleteRole(role.id)
      message.success('角色已删除')
      await loadPageData()
    } catch (error) {
      message.error(getErrorMessage(error))
    }
  }

  const handleSaveAuth = async () => {
    if (!selectedRole) {
      return
    }

    const values = await authForm.validateFields()
    setIsSubmitting(true)

    try {
      await rbacApi.assignRoleMenus(selectedRole.id, checkedMenuIds.map(String))
      await rbacApi.assignRoleApiPermissions(selectedRole.id, values.apiPermissionIds ?? [])
      message.success('权限已保存')
      setIsAuthModalOpen(false)
      await loadPageData()
    } catch (error) {
      message.error(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  const columns: TableColumnsType<Role> = [
    {
      dataIndex: 'name',
      title: '角色名称',
    },
    {
      dataIndex: 'code',
      title: '角色编码',
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
      width: 220,
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => openEditModal(record)}>
            编辑
          </Button>
          <Button type="link" onClick={() => openAuthModal(record)}>
            授权
          </Button>
          <Popconfirm
            title="确认删除该角色？"
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
          角色管理
        </Title>
        <Button type="primary" onClick={openCreateModal}>
          新增角色
        </Button>
      </Space>
      {errorMessage ? <Alert showIcon type="error" message={errorMessage} style={{ marginBottom: 16 }} /> : null}
      <Table columns={columns} dataSource={roles} loading={isLoading} pagination={false} rowKey="id" />
      <Modal
        title={editingRole ? '编辑角色' : '新增角色'}
        open={isRoleModalOpen}
        okText="保存"
        confirmLoading={isSubmitting}
        onCancel={() => setIsRoleModalOpen(false)}
        onOk={handleSaveRole}
      >
        <Form<RoleFormValues> form={roleForm} layout="vertical">
          <Form.Item label="角色名称" name="name" rules={[{ required: true, message: '请输入角色名称' }]}>
            <Input maxLength={50} />
          </Form.Item>
          <Form.Item label="角色编码" name="code" rules={[{ required: true, message: '请输入角色编码' }]}>
            <Input maxLength={50} />
          </Form.Item>
          <Form.Item label="状态" name="status" rules={[{ required: true, message: '请选择状态' }]}>
            <Select options={statusOptions} />
          </Form.Item>
          <Form.Item label="备注" name="remark">
            <TextArea maxLength={200} rows={3} />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title={selectedRole ? `角色授权：${selectedRole.name}` : '角色授权'}
        open={isAuthModalOpen}
        okText="保存"
        width={720}
        confirmLoading={isSubmitting}
        onCancel={() => setIsAuthModalOpen(false)}
        onOk={handleSaveAuth}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Title level={5}>菜单权限</Title>
            <Tree
              checkable
              checkedKeys={checkedMenuIds}
              defaultExpandAll
              treeData={menuTreeData}
              onCheck={(checkedKeys) => {
                setCheckedMenuIds(Array.isArray(checkedKeys) ? checkedKeys : checkedKeys.checked)
              }}
            />
          </div>
          <Form form={authForm} layout="vertical">
            <Form.Item label="接口权限" name="apiPermissionIds" initialValue={[]}>
              <Select
                mode="multiple"
                options={apiPermissionOptions}
                placeholder="请选择接口权限"
                optionFilterProp="label"
              />
            </Form.Item>
          </Form>
        </Space>
      </Modal>
    </section>
  )
}

export default Roles
