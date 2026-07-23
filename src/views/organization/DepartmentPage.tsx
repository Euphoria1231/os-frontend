import { memo, useMemo, useState } from 'react'
import {
  ApartmentOutlined,
  DeleteOutlined,
  EditOutlined,
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
  InputNumber,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Typography,
  type TableProps,
} from 'antd'
import { PageHeader } from '../../components/common/PageHeader.tsx'
import { StatusTag } from '../../components/common/StatusTag.tsx'
import { useAuth } from '../../hooks/auth/useAuth.ts'
import { useDepartments } from '../../hooks/organization/useDepartments.ts'
import type {
  Department,
  DepartmentRequest,
} from '../../services/organization/organization.types.ts'
import { formatDateTime } from '../../utils/date.ts'
import { getErrorMessage } from '../../utils/error.ts'
import './OrganizationPage.less'

const DEFAULT_VALUES: DepartmentRequest = {
  parentId: 0,
  name: '',
  leaderEmployeeId: null,
  sortOrder: 0,
  status: 1,
}

export const DepartmentPage = memo(function DepartmentPage() {
  const [form] = Form.useForm<DepartmentRequest>()
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const { message } = App.useApp()
  const { hasAuthority } = useAuth()
  const {
    departments,
    loading,
    error,
    reload,
    createDepartment,
    updateDepartment,
    deleteDepartment,
  } = useDepartments()

  const canCreate = hasAuthority('POST:/api/user/**')
  const canUpdate = hasAuthority('PUT:/api/user/**')
  const canDelete = hasAuthority('DELETE:/api/user/**')
  const departmentNames = useMemo(
    () => new Map(departments.map((department) => [department.id, department.name])),
    [departments],
  )
  const parentOptions = useMemo(
    () => [
      { label: '顶级部门', value: 0 },
      ...departments
        .filter((department) => department.id !== editingDepartment?.id)
        .map((department) => ({ label: department.name, value: department.id })),
    ],
    [departments, editingDepartment?.id],
  )

  const openCreateModal = () => {
    setEditingDepartment(null)
    form.setFieldsValue(DEFAULT_VALUES)
    setModalOpen(true)
  }

  const openEditModal = (department: Department) => {
    setEditingDepartment(department)
    form.setFieldsValue({
      parentId: department.parentId,
      name: department.name,
      leaderEmployeeId: department.leaderEmployeeId,
      sortOrder: department.sortOrder,
      status: department.status,
    })
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingDepartment(null)
    form.resetFields()
  }

  const handleSubmit = async (values: DepartmentRequest) => {
    setSubmitting(true)
    try {
      const payload: DepartmentRequest = {
        ...values,
        name: values.name.trim(),
        leaderEmployeeId: values.leaderEmployeeId ?? null,
      }

      if (editingDepartment) {
        await updateDepartment(editingDepartment.id, payload)
        message.success('部门信息已更新')
      } else {
        await createDepartment(payload)
        message.success('部门已创建')
      }
      closeModal()
    } catch (requestError) {
      message.error(getErrorMessage(requestError, '部门信息保存失败'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (department: Department) => {
    try {
      await deleteDepartment(department.id)
      message.success(`已删除部门“${department.name}”`)
    } catch (requestError) {
      message.error(getErrorMessage(requestError, '部门删除失败'))
    }
  }

  const columns: TableProps<Department>['columns'] = [
    {
      title: '部门名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, department) => (
        <Space size={10}>
          <span className="organization-row-icon">
            <ApartmentOutlined />
          </span>
          <div className="organization-primary-cell">
            <Typography.Text strong>{name}</Typography.Text>
            <Typography.Text type="secondary">ID {department.id}</Typography.Text>
          </div>
        </Space>
      ),
    },
    {
      title: '上级部门',
      dataIndex: 'parentId',
      key: 'parentId',
      render: (parentId: number) =>
        parentId === 0 ? (
          <Typography.Text type="secondary">顶级部门</Typography.Text>
        ) : (
          departmentNames.get(parentId) ?? `部门 ${parentId}`
        ),
    },
    {
      title: '负责人',
      dataIndex: 'leaderEmployeeId',
      key: 'leaderEmployeeId',
      render: (leaderEmployeeId: number | null) =>
        leaderEmployeeId ? `员工 ${leaderEmployeeId}` : <Typography.Text type="secondary">未设置</Typography.Text>,
    },
    {
      title: '排序',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 90,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      render: (status: Department['status']) => <StatusTag status={status} />,
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
      render: (_, department) => (
        <Space size={4}>
          {canUpdate && (
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => openEditModal(department)}
            >
              编辑
            </Button>
          )}
          {canDelete && (
            <Popconfirm
              title="删除该部门？"
              description="存在下级部门或关联员工时，后端将拒绝删除。"
              okText="确认删除"
              cancelText="取消"
              onConfirm={() => handleDelete(department)}
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

  const activeCount = departments.filter((department) => department.status === 1).length
  const rootCount = departments.filter((department) => department.parentId === 0).length

  return (
    <section className="organization-page">
      <PageHeader
        eyebrow=""
        title="部门管理"
        description=""
        extra={
          canCreate ? (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
              新建部门
            </Button>
          ) : null
        }
      />

      <Row gutter={[14, 14]} className="organization-stats">
        <Col xs={24} sm={8}>
          <Card bordered={false}>
            <Statistic title="部门总数" value={departments.length} suffix="个" />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false}>
            <Statistic title="正常启用" value={activeCount} suffix="个" />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false}>
            <Statistic title="顶级部门" value={rootCount} suffix="个" />
          </Card>
        </Col>
      </Row>

      {Boolean(error) && (
        <Alert
          className="organization-alert"
          type="warning"
          showIcon
          message="部门数据暂时无法加载"
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
            <Typography.Title level={4}>组织目录</Typography.Title>
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
        <Table<Department>
          rowKey="id"
          columns={columns}
          dataSource={departments}
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 个部门` }}
          scroll={{ x: 920 }}
        />
      </Card>

      <Modal
        title={editingDepartment ? '编辑部门' : '新建部门'}
        open={modalOpen}
        onCancel={closeModal}
        footer={null}
        width={620}
      >
        <Form<DepartmentRequest>
          form={form}
          layout="vertical"
          initialValues={DEFAULT_VALUES}
          onFinish={handleSubmit}
          requiredMark="optional"
        >
          <Form.Item
            label="部门名称"
            name="name"
            rules={[
              { required: true, whitespace: true, message: '请输入部门名称' },
              { max: 100, message: '部门名称不能超过 100 个字符' },
            ]}
          >
            <Input placeholder="例如：产品研发中心" maxLength={100} showCount />
          </Form.Item>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item label="上级部门" name="parentId" rules={[{ required: true }]}>
                <Select options={parentOptions} showSearch optionFilterProp="label" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="负责人员工 ID" name="leaderEmployeeId">
                <InputNumber min={1} precision={0} placeholder="可暂不设置" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item label="显示顺序" name="sortOrder" rules={[{ required: true }]}>
                <InputNumber min={0} precision={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="部门状态" name="status" rules={[{ required: true }]}>
                <Select
                  options={[
                    { label: '启用', value: 1 },
                    { label: '停用', value: 0 },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
          <div className="organization-form-actions">
            <Button onClick={closeModal}>取消</Button>
            <Button type="primary" htmlType="submit" loading={submitting}>
              {editingDepartment ? '保存修改' : '创建部门'}
            </Button>
          </div>
        </Form>
      </Modal>
    </section>
  )
})
