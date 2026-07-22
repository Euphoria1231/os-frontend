import { Alert, Button, Form, Input, InputNumber, Modal, Popconfirm, Select, Space, Table, Typography, message } from 'antd'
import type { TableColumnsType } from 'antd'
import { useEffect, useState } from 'react'
import { isApiClientError } from '../../api/core'
import { organizationApi } from '../../api/user/organization'
import type { Department, Position, PositionRequest, RecordStatus } from '../../types/organization'

const { TextArea } = Input
const { Title } = Typography

type PositionFormValues = PositionRequest

const statusOptions: Array<{ label: string; value: RecordStatus }> = [
  { label: '启用', value: 'enabled' },
  { label: '停用', value: 'disabled' },
]

const getErrorMessage = (error: unknown) =>
  isApiClientError(error) ? error.message : '操作失败，请稍后重试'

const Positions = () => {
  const [departments, setDepartments] = useState<Department[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingPosition, setEditingPosition] = useState<Position | null>(null)
  const [positions, setPositions] = useState<Position[]>([])
  const [form] = Form.useForm<PositionFormValues>()

  const loadPageData = async () => {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const [departmentList, positionList] = await Promise.all([
        organizationApi.listDepartments(),
        organizationApi.listPositions(),
      ])
      setDepartments(departmentList)
      setPositions(positionList)
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

  const departmentOptions = departments.map((department) => ({
    label: department.name,
    value: department.id,
  }))

  const openCreateModal = () => {
    setEditingPosition(null)
    form.setFieldsValue({
      code: '',
      departmentId: undefined,
      name: '',
      remark: '',
      sortOrder: 0,
      status: 'enabled',
    })
    setIsModalOpen(true)
  }

  const openEditModal = (position: Position) => {
    setEditingPosition(position)
    form.setFieldsValue({
      code: position.code,
      departmentId: position.departmentId,
      name: position.name,
      remark: position.remark,
      sortOrder: position.sortOrder,
      status: position.status,
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    setIsSubmitting(true)

    try {
      if (editingPosition) {
        await organizationApi.updatePosition(editingPosition.id, values)
        message.success('岗位已更新')
      } else {
        await organizationApi.createPosition(values)
        message.success('岗位已创建')
      }

      setIsModalOpen(false)
      await loadPageData()
    } catch (error) {
      message.error(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (position: Position) => {
    try {
      await organizationApi.deletePosition(position.id)
      message.success('岗位已删除')
      await loadPageData()
    } catch (error) {
      message.error(getErrorMessage(error))
    }
  }

  const columns: TableColumnsType<Position> = [
    {
      dataIndex: 'name',
      title: '岗位名称',
    },
    {
      dataIndex: 'code',
      title: '岗位编码',
    },
    {
      dataIndex: 'departmentName',
      title: '所属部门',
      render: (value: string | undefined, record) =>
        value || departments.find((department) => department.id === record.departmentId)?.name || '-',
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
            title="确认删除该岗位？"
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
          岗位管理
        </Title>
        <Button type="primary" onClick={openCreateModal}>
          新增岗位
        </Button>
      </Space>
      {errorMessage ? <Alert showIcon type="error" message={errorMessage} style={{ marginBottom: 16 }} /> : null}
      <Table
        columns={columns}
        dataSource={positions}
        loading={isLoading}
        pagination={false}
        rowKey="id"
      />
      <Modal
        title={editingPosition ? '编辑岗位' : '新增岗位'}
        open={isModalOpen}
        okText="保存"
        confirmLoading={isSubmitting}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSubmit}
      >
        <Form<PositionFormValues> form={form} layout="vertical">
          <Form.Item label="岗位名称" name="name" rules={[{ required: true, message: '请输入岗位名称' }]}>
            <Input maxLength={50} />
          </Form.Item>
          <Form.Item label="岗位编码" name="code" rules={[{ required: true, message: '请输入岗位编码' }]}>
            <Input maxLength={50} />
          </Form.Item>
          <Form.Item label="所属部门" name="departmentId">
            <Select allowClear options={departmentOptions} placeholder="请选择所属部门" />
          </Form.Item>
          <Form.Item label="排序" name="sortOrder" rules={[{ required: true, message: '请输入排序值' }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
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

export default Positions
