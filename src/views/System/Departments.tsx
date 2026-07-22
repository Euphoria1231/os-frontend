import { Alert, Button, Form, Input, InputNumber, Modal, Popconfirm, Select, Space, Table, Typography, message } from 'antd'
import type { TableColumnsType } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { isApiClientError } from '../../api/core'
import { organizationApi } from '../../api/user/organization'
import type { Department, DepartmentRequest, RecordStatus } from '../../types/organization'

const { Title } = Typography

type DepartmentFormValues = DepartmentRequest

const statusOptions: Array<{ label: string; value: RecordStatus }> = [
  { label: '启用', value: 'enabled' },
  { label: '停用', value: 'disabled' },
]

const getErrorMessage = (error: unknown) =>
  isApiClientError(error) ? error.message : '操作失败，请稍后重试'

const Departments = () => {
  const [departments, setDepartments] = useState<Department[]>([])
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form] = Form.useForm<DepartmentFormValues>()

  const loadDepartments = async () => {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      setDepartments(await organizationApi.listDepartments())
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadDepartments()
    }, 0)

    return () => {
      window.clearTimeout(timer)
    }
  }, [])

  const parentOptions = useMemo(
    () =>
      departments
        .filter((department) => department.id !== editingDepartment?.id)
        .map((department) => ({
          label: department.name,
          value: department.id,
        })),
    [departments, editingDepartment?.id],
  )

  const openCreateModal = () => {
    setEditingDepartment(null)
    form.setFieldsValue({
      code: '',
      leaderName: '',
      name: '',
      parentId: undefined,
      phone: '',
      sortOrder: 0,
      status: 'enabled',
    })
    setIsModalOpen(true)
  }

  const openEditModal = (department: Department) => {
    setEditingDepartment(department)
    form.setFieldsValue({
      code: department.code,
      leaderName: department.leaderName,
      name: department.name,
      parentId: department.parentId,
      phone: department.phone,
      sortOrder: department.sortOrder,
      status: department.status,
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    setIsSubmitting(true)

    try {
      if (editingDepartment) {
        await organizationApi.updateDepartment(editingDepartment.id, values)
        message.success('部门已更新')
      } else {
        await organizationApi.createDepartment(values)
        message.success('部门已创建')
      }

      setIsModalOpen(false)
      await loadDepartments()
    } catch (error) {
      message.error(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (department: Department) => {
    try {
      await organizationApi.deleteDepartment(department.id)
      message.success('部门已删除')
      await loadDepartments()
    } catch (error) {
      message.error(getErrorMessage(error))
    }
  }

  const columns: TableColumnsType<Department> = [
    {
      dataIndex: 'name',
      title: '部门名称',
    },
    {
      dataIndex: 'code',
      title: '部门编码',
    },
    {
      dataIndex: 'leaderName',
      title: '负责人',
      render: (value: string | undefined) => value || '-',
    },
    {
      dataIndex: 'phone',
      title: '联系电话',
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
            title="确认删除该部门？"
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
          部门管理
        </Title>
        <Button type="primary" onClick={openCreateModal}>
          新增部门
        </Button>
      </Space>
      {errorMessage ? <Alert showIcon type="error" message={errorMessage} style={{ marginBottom: 16 }} /> : null}
      <Table
        columns={columns}
        dataSource={departments}
        loading={isLoading}
        pagination={false}
        rowKey="id"
      />
      <Modal
        title={editingDepartment ? '编辑部门' : '新增部门'}
        open={isModalOpen}
        okText="保存"
        confirmLoading={isSubmitting}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSubmit}
      >
        <Form<DepartmentFormValues> form={form} layout="vertical">
          <Form.Item label="部门名称" name="name" rules={[{ required: true, message: '请输入部门名称' }]}>
            <Input maxLength={50} />
          </Form.Item>
          <Form.Item label="部门编码" name="code" rules={[{ required: true, message: '请输入部门编码' }]}>
            <Input maxLength={50} />
          </Form.Item>
          <Form.Item label="上级部门" name="parentId">
            <Select allowClear options={parentOptions} placeholder="请选择上级部门" />
          </Form.Item>
          <Form.Item label="负责人" name="leaderName">
            <Input maxLength={50} />
          </Form.Item>
          <Form.Item label="联系电话" name="phone">
            <Input maxLength={30} />
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

export default Departments
