import { memo, useMemo, useState } from 'react'
import {
  DeleteOutlined,
  EditOutlined,
  FormOutlined,
  PlusOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
  SearchOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons'
import {
  Alert,
  App,
  Avatar,
  Button,
  Card,
  Col,
  DatePicker,
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
  Tag,
  Typography,
  type TableProps,
} from 'antd'
import dayjs, { type Dayjs } from 'dayjs'
import { PageHeader } from '../../components/common/PageHeader.tsx'
import { StatusTag } from '../../components/common/StatusTag.tsx'
import { useAuth } from '../../hooks/auth/useAuth.ts'
import { useEmployees } from '../../hooks/employee/useEmployees.ts'
import { useDepartments } from '../../hooks/organization/useDepartments.ts'
import { usePositions } from '../../hooks/organization/usePositions.ts'
import { attendanceService } from '../../services/attendance/attendance.service.ts'
import type {
  Employee,
  EmployeeCreateRequest,
  EmployeeFormValues,
  EmployeeUpdateRequest,
} from '../../services/employee/employee.types.ts'
import { rbacService } from '../../services/rbac/rbac.service.ts'
import type { Role } from '../../services/rbac/rbac.types.ts'
import { formatDateTime } from '../../utils/date.ts'
import { getErrorMessage } from '../../utils/error.ts'
import './EmployeePage.less'

const DEFAULT_VALUES: EmployeeFormValues = {
  employeeNo: '',
  username: '',
  password: '',
  realName: '',
  leaderId: null,
  phone: null,
  email: null,
  status: 1,
}

function getInitials(name: string): string {
  return name.trim().slice(-2)
}

interface MakeupQuotaFormValues {
  quotaMonth: Dayjs
  totalCount: number
}

export const EmployeePage = memo(function EmployeePage() {
  const [form] = Form.useForm<EmployeeFormValues>()
  const [makeupQuotaForm] = Form.useForm<MakeupQuotaFormValues>()
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | Employee['status']>('all')
  const [roleTarget, setRoleTarget] = useState<Employee | null>(null)
  const [roleModalOpen, setRoleModalOpen] = useState(false)
  const [roles, setRoles] = useState<Role[]>([])
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([])
  const [rolesLoading, setRolesLoading] = useState(false)
  const [rolesSubmitting, setRolesSubmitting] = useState(false)
  const [makeupQuotaTarget, setMakeupQuotaTarget] = useState<Employee | null>(null)
  const [makeupQuotaModalOpen, setMakeupQuotaModalOpen] = useState(false)
  const [makeupQuotaSubmitting, setMakeupQuotaSubmitting] = useState(false)
  const { message } = App.useApp()
  const { user, isSuperAdmin, hasAuthority } = useAuth()
  const {
    employees,
    loading,
    error,
    reload,
    createEmployee,
    updateEmployee,
    deleteEmployee,
  } = useEmployees(isSuperAdmin ? 'all' : 'direct-reports')
  const canManageEmployees = isSuperAdmin || hasAuthority('PUT:/api/user/**')
  const { departments } = useDepartments(canManageEmployees)
  const { positions } = usePositions(canManageEmployees)

  const canCreate = hasAuthority('POST:/api/user/**')
  const canUpdate = hasAuthority('PUT:/api/user/**')
  const canDelete = hasAuthority('DELETE:/api/user/**')
  const canAssignMakeupQuota = hasAuthority('PUT:/api/attendance/makeup-quotas/**')
  const filteredEmployees = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase()
    return employees.filter((employee) => {
      const matchesStatus = statusFilter === 'all' || employee.status === statusFilter
      const matchesKeyword =
        !normalizedKeyword ||
        [
          employee.realName,
          employee.employeeNo,
          employee.username,
          employee.departmentName,
          employee.positionName,
        ].some((value) => value?.toLowerCase().includes(normalizedKeyword))
      return matchesStatus && matchesKeyword
    })
  }, [employees, keyword, statusFilter])

  const departmentOptions = departments
    .filter((department) => department.status === 1)
    .map((department) => ({ label: department.name, value: department.id }))
  const positionOptions = positions
    .filter((position) => position.status === 1)
    .map((position) => ({ label: position.name, value: position.id }))
  const leaderOptions = employees
    .filter((employee) => employee.status === 1 && employee.id !== editingEmployee?.id)
    .map((employee) => ({
      label: `${employee.realName} · ${employee.employeeNo}`,
      value: employee.id,
    }))

  const openCreateModal = () => {
    setEditingEmployee(null)
    form.setFieldsValue(DEFAULT_VALUES)
    setModalOpen(true)
  }

  const openEditModal = (employee: Employee) => {
    setEditingEmployee(employee)
    form.setFieldsValue({
      employeeNo: employee.employeeNo,
      username: employee.username,
      password: '',
      realName: employee.realName,
      departmentId: employee.departmentId,
      positionId: employee.positionId,
      leaderId: employee.leaderId,
      phone: employee.phone,
      email: employee.email,
      status: employee.status,
    })
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingEmployee(null)
    form.resetFields()
  }

  const handleSubmit = async (values: EmployeeFormValues) => {
    if (!values.departmentId || !values.positionId) {
      return
    }

    setSubmitting(true)
    try {
      const commonValues: EmployeeUpdateRequest = {
        realName: values.realName.trim(),
        departmentId: values.departmentId,
        positionId: values.positionId,
        leaderId: values.leaderId || null,
        phone: values.phone?.trim() || null,
        email: values.email?.trim() || null,
        status: values.status,
      }

      if (editingEmployee) {
        await updateEmployee(editingEmployee.id, commonValues)
        message.success('员工信息已更新')
      } else {
        const createValues: EmployeeCreateRequest = {
          ...commonValues,
          employeeNo: values.employeeNo.trim(),
          username: values.username.trim(),
          password: values.password,
        }
        await createEmployee(createValues)
        message.success('员工账号已创建')
      }
      closeModal()
    } catch (requestError) {
      message.error(getErrorMessage(requestError, '员工信息保存失败'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (employee: Employee) => {
    try {
      await deleteEmployee(employee.id)
      message.success(`已删除员工“${employee.realName}”`)
    } catch (requestError) {
      message.error(getErrorMessage(requestError, '员工删除失败'))
    }
  }

  const openRoleModal = async (employee: Employee) => {
    setRoleTarget(employee)
    setRoleModalOpen(true)
    setRolesLoading(true)
    try {
      const [roleList, authorization] = await Promise.all([
        rbacService.listRoles(),
        rbacService.getEmployeeAuthorization(employee.id),
      ])
      setRoles(roleList)
      setSelectedRoleIds(authorization.roles.map((role) => role.id))
    } catch (requestError) {
      message.error(getErrorMessage(requestError, '员工角色加载失败'))
    } finally {
      setRolesLoading(false)
    }
  }

  const closeRoleModal = () => {
    setRoleModalOpen(false)
    setRoleTarget(null)
    setRoles([])
    setSelectedRoleIds([])
  }

  const handleAssignRoles = async () => {
    if (!roleTarget) {
      return
    }

    setRolesSubmitting(true)
    try {
      await rbacService.assignEmployeeRoles(roleTarget.id, selectedRoleIds)
      message.success(`已更新“${roleTarget.realName}”的角色`)
      closeRoleModal()
    } catch (requestError) {
      message.error(getErrorMessage(requestError, '角色分配失败'))
    } finally {
      setRolesSubmitting(false)
    }
  }

  const openMakeupQuotaModal = (employee: Employee) => {
    setMakeupQuotaTarget(employee)
    makeupQuotaForm.setFieldsValue({
      quotaMonth: dayjs().startOf('month'),
      totalCount: 5,
    })
    setMakeupQuotaModalOpen(true)
  }

  const closeMakeupQuotaModal = () => {
    setMakeupQuotaModalOpen(false)
    setMakeupQuotaTarget(null)
    makeupQuotaForm.resetFields()
  }

  const handleAssignMakeupQuota = async (values: MakeupQuotaFormValues) => {
    if (!makeupQuotaTarget) {
      return
    }

    setMakeupQuotaSubmitting(true)
    try {
      const quota = await attendanceService.assignMakeupQuota(makeupQuotaTarget.id, {
        quotaMonth: values.quotaMonth.format('YYYY-MM'),
        totalCount: values.totalCount,
      })
      message.success(
        `已为“${makeupQuotaTarget.realName}”配置 ${quota.quotaMonth} 补签额度 ${quota.totalCount} 次`,
      )
      closeMakeupQuotaModal()
    } catch (requestError) {
      message.error(getErrorMessage(requestError, '补签额度配置失败'))
    } finally {
      setMakeupQuotaSubmitting(false)
    }
  }

  const columns: TableProps<Employee>['columns'] = [
    {
      title: '员工',
      dataIndex: 'realName',
      key: 'realName',
      fixed: 'left',
      width: 210,
      render: (realName: string, employee) => (
        <Space size={11}>
          <Avatar className="employee-avatar" icon={!realName ? <UserOutlined /> : undefined}>
            {realName ? getInitials(realName) : null}
          </Avatar>
          <div className="employee-primary-cell">
            <Typography.Text strong>{realName}</Typography.Text>
            <Typography.Text type="secondary">{employee.employeeNo}</Typography.Text>
          </div>
        </Space>
      ),
    },
    {
      title: '登录账号',
      dataIndex: 'username',
      key: 'username',
      width: 140,
      render: (username: string) => <Tag bordered={false}>{username}</Tag>,
    },
    {
      title: '组织任职',
      key: 'organization',
      width: 190,
      render: (_, employee) => (
        <div className="employee-organization-cell">
          <Typography.Text>{employee.departmentName ?? `部门 ${employee.departmentId}`}</Typography.Text>
          <Typography.Text type="secondary">
            {employee.positionName ?? `岗位 ${employee.positionId}`}
          </Typography.Text>
        </div>
      ),
    },
    {
      title: '直属领导',
      dataIndex: 'leaderName',
      key: 'leaderName',
      width: 120,
      render: (leaderName: string | null) =>
        leaderName ?? <Typography.Text type="secondary">未设置</Typography.Text>,
    },
    {
      title: '联系方式',
      key: 'contact',
      width: 210,
      render: (_, employee) => (
        <div className="employee-contact-cell">
          <Typography.Text>{employee.phone || '—'}</Typography.Text>
          <Typography.Text type="secondary">{employee.email || '未填写邮箱'}</Typography.Text>
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      render: (status: Employee['status']) => <StatusTag status={status} />,
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 165,
      render: formatDateTime,
    },
  ]

  if (canUpdate || canDelete || canAssignMakeupQuota) {
    columns.push({
      title: '操作',
      key: 'actions',
      fixed: 'right',
      width: 310,
      render: (_, employee) => {
        const canAssignThisEmployee = canAssignMakeupQuota
          && employee.leaderId === user?.id
          && employee.status === 1
        return (
          <Space size={2}>
            {canAssignThisEmployee && (
              <Button
                type="text"
                size="small"
                icon={<FormOutlined />}
                onClick={() => openMakeupQuotaModal(employee)}
              >
                补签额度
              </Button>
            )}
            {canUpdate && (
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => openEditModal(employee)}
              >
                编辑
              </Button>
            )}
            {canUpdate && (
              <Button
                type="text"
                size="small"
                icon={<SafetyCertificateOutlined />}
                onClick={() => void openRoleModal(employee)}
              >
                角色
              </Button>
            )}
            {canDelete && (
              <Popconfirm
                title="删除该员工？"
                description="删除后该账号将无法登录，请谨慎操作。"
                okText="确认删除"
                cancelText="取消"
                onConfirm={() => handleDelete(employee)}
              >
                <Button type="text" size="small" danger icon={<DeleteOutlined />}>
                  删除
                </Button>
              </Popconfirm>
            )}
            {!canAssignThisEmployee && !canUpdate && !canDelete && (
              <Typography.Text type="secondary">非直属员工</Typography.Text>
            )}
          </Space>
        )
      },
    })
  }

  const activeCount = employees.filter((employee) => employee.status === 1).length
  const departmentCount = new Set(employees.map((employee) => employee.departmentId)).size

  return (
    <section className="employee-page">
      <PageHeader
        eyebrow=""
        title="员工管理"
        description=""
        extra={
          canCreate ? (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
              新建员工
            </Button>
          ) : null
        }
      />

      <Row gutter={[14, 14]} className="employee-stats">
        <Col xs={24} sm={8}>
          <Card bordered={false}>
            <Statistic title="员工总数" value={employees.length} suffix="人" prefix={<TeamOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false}>
            <Statistic title="在职启用" value={activeCount} suffix="人" />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false}>
            <Statistic title="覆盖部门" value={departmentCount} suffix="个" />
          </Card>
        </Col>
      </Row>

      {Boolean(error) && (
        <Alert
          className="employee-alert"
          type="warning"
          showIcon
          message="员工数据暂时无法加载"
          description={getErrorMessage(error, '请稍后重试')}
          action={
            <Button size="small" icon={<ReloadOutlined />} onClick={() => void reload()}>
              重新加载
            </Button>
          }
        />
      )}

      <Card bordered={false} className="employee-table-card">
        <div className="employee-toolbar">
          <div>
            <Typography.Title level={4}>员工目录</Typography.Title>
            <Typography.Text type="secondary">共显示 {filteredEmployees.length} 条人员记录</Typography.Text>
          </div>
          <Space wrap>
            <Input
              allowClear
              prefix={<SearchOutlined />}
              placeholder="搜索姓名、工号、账号"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
            />
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { label: '全部状态', value: 'all' },
                { label: '启用', value: 1 },
                { label: '停用', value: 0 },
              ]}
            />
            <Button type="text" icon={<ReloadOutlined />} loading={loading} onClick={() => void reload()}>
              刷新
            </Button>
          </Space>
        </div>
        <Table<Employee>
          rowKey="id"
          columns={columns}
          dataSource={filteredEmployees}
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 名员工` }}
          scroll={{ x: 1420 }}
        />
      </Card>

      <Modal
        title={editingEmployee ? '编辑员工' : '新建员工'}
        open={modalOpen}
        onCancel={closeModal}
        footer={null}
        width={760}
      >
        <Form<EmployeeFormValues>
          form={form}
          layout="vertical"
          initialValues={DEFAULT_VALUES}
          onFinish={handleSubmit}
          requiredMark="optional"
        >
          {!editingEmployee && (
            <Row gutter={16}>
              <Col xs={24} sm={8}>
                <Form.Item
                  label="员工编号"
                  name="employeeNo"
                  rules={[
                    { required: true, whitespace: true, message: '请输入员工编号' },
                    { max: 50, message: '不能超过 50 个字符' },
                  ]}
                >
                  <Input placeholder="例如：E2026001" maxLength={50} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item
                  label="登录账号"
                  name="username"
                  rules={[
                    { required: true, whitespace: true, message: '请输入登录账号' },
                    { max: 50, message: '不能超过 50 个字符' },
                  ]}
                >
                  <Input placeholder="用于登录系统" maxLength={50} autoComplete="off" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item
                  label="初始密码"
                  name="password"
                  rules={[
                    { required: true, message: '请输入初始密码' },
                    { min: 8, max: 72, message: '密码长度必须为 8 到 72 个字符' },
                  ]}
                >
                  <Input.Password placeholder="至少 8 个字符" maxLength={72} autoComplete="new-password" />
                </Form.Item>
              </Col>
            </Row>
          )}

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="员工姓名"
                name="realName"
                rules={[
                  { required: true, whitespace: true, message: '请输入员工姓名' },
                  { max: 100, message: '不能超过 100 个字符' },
                ]}
              >
                <Input placeholder="请输入真实姓名" maxLength={100} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="直属领导" name="leaderId">
                <Select
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  options={leaderOptions}
                  placeholder="可暂不设置"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item label="所属部门" name="departmentId" rules={[{ required: true, message: '请选择部门' }]}>
                <Select showSearch optionFilterProp="label" options={departmentOptions} placeholder="请选择部门" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="任职岗位" name="positionId" rules={[{ required: true, message: '请选择岗位' }]}>
                <Select showSearch optionFilterProp="label" options={positionOptions} placeholder="请选择岗位" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item label="手机号码" name="phone" rules={[{ max: 30, message: '不能超过 30 个字符' }]}>
                <Input placeholder="可选" maxLength={30} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="企业邮箱"
                name="email"
                rules={[
                  { type: 'email', message: '邮箱格式不正确' },
                  { max: 100, message: '不能超过 100 个字符' },
                ]}
              >
                <Input placeholder="name@company.com" maxLength={100} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="账号状态" name="status" rules={[{ required: true }]}>
            <Select
              options={[
                { label: '启用', value: 1 },
                { label: '停用', value: 0 },
              ]}
            />
          </Form.Item>

          <div className="employee-form-actions">
            <Button onClick={closeModal}>取消</Button>
            <Button type="primary" htmlType="submit" loading={submitting}>
              {editingEmployee ? '保存修改' : '创建员工'}
            </Button>
          </div>
        </Form>
      </Modal>

      <Modal
        title={`分配角色${roleTarget ? ` · ${roleTarget.realName}` : ''}`}
        open={roleModalOpen}
        onCancel={closeRoleModal}
        okText="保存角色"
        cancelText="取消"
        confirmLoading={rolesSubmitting}
        onOk={() => void handleAssignRoles()}
      >
        <div className="employee-role-panel">
          <Typography.Paragraph type="secondary">
            角色决定员工可见菜单与可调用接口；保存后重新登录即可获取最新 JWT 权限。
          </Typography.Paragraph>
          <Select
            mode="multiple"
            allowClear
            loading={rolesLoading}
            value={selectedRoleIds}
            onChange={setSelectedRoleIds}
            options={roles.map((role) => ({
              label: `${role.name} · ${role.code}`,
              value: role.id,
              disabled: role.status === 0,
            }))}
            placeholder="请选择角色"
            style={{ width: '100%' }}
          />
        </div>
      </Modal>

      <Modal
        title={`配置补签额度${makeupQuotaTarget ? ` · ${makeupQuotaTarget.realName}` : ''}`}
        open={makeupQuotaModalOpen}
        onCancel={closeMakeupQuotaModal}
        footer={null}
        width={560}
      >

        <Form<MakeupQuotaFormValues>
          form={makeupQuotaForm}
          layout="vertical"
          onFinish={handleAssignMakeupQuota}
          requiredMark="optional"
        >
          <Form.Item
            label="额度月份"
            name="quotaMonth"
            rules={[{ required: true, message: '请选择额度月份' }]}
          >
            <DatePicker picker="month" format="YYYY-MM" allowClear={false} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            label="补签总次数"
            name="totalCount"
            rules={[{ required: true, message: '请输入补签总次数' }]}
          >
            <InputNumber min={1} precision={0} style={{ width: '100%' }} />
          </Form.Item>
          <div className="employee-form-actions">
            <Button onClick={closeMakeupQuotaModal}>取消</Button>
            <Button type="primary" htmlType="submit" loading={makeupQuotaSubmitting}>
              保存额度
            </Button>
          </div>
        </Form>
      </Modal>
    </section>
  )
})
