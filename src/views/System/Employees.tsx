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
import { useEffect, useMemo, useState } from 'react'
import { isApiClientError } from '../../api/core'
import { employeeApi } from '../../api/user/employees'
import { organizationApi } from '../../api/user/organization'
import type { Employee, EmployeeQuery, EmployeeRequest, RoleSummary } from '../../types/employee'
import type { Department, Position, RecordStatus } from '../../types/organization'

const { Title } = Typography

type EmployeeFormValues = EmployeeRequest

const statusOptions: Array<{ label: string; value: RecordStatus }> = [
  { label: '启用', value: 'enabled' },
  { label: '停用', value: 'disabled' },
]

const getErrorMessage = (error: unknown) =>
  isApiClientError(error) ? error.message : '操作失败，请稍后重试'

const Employees = () => {
  const [departments, setDepartments] = useState<Department[]>([])
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [positions, setPositions] = useState<Position[]>([])
  const [roles, setRoles] = useState<RoleSummary[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [employeeForm] = Form.useForm<EmployeeFormValues>()
  const [filterForm] = Form.useForm<EmployeeQuery>()
  const [roleForm] = Form.useForm<{ roleIds: string[] }>()

  const departmentOptions = departments.map((department) => ({
    label: department.name,
    value: department.id,
  }))

  const positionOptions = positions.map((position) => ({
    label: position.name,
    value: position.id,
  }))

  const roleOptions = roles.map((role) => ({
    label: role.name,
    value: role.id,
  }))

  const roleNameMap = useMemo(
    () => new Map(roles.map((role) => [role.id, role.name])),
    [roles],
  )

  const loadEmployees = async (query?: EmployeeQuery) => {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      setEmployees(await employeeApi.listEmployees(query))
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }

  const loadPageData = async () => {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const [departmentList, positionList, roleList, employeeList] = await Promise.all([
        organizationApi.listDepartments(),
        organizationApi.listPositions(),
        employeeApi.listRoles(),
        employeeApi.listEmployees(),
      ])
      setDepartments(departmentList)
      setPositions(positionList)
      setRoles(roleList)
      setEmployees(employeeList)
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
    setEditingEmployee(null)
    employeeForm.setFieldsValue({
      departmentId: undefined,
      email: '',
      employeeNo: '',
      password: '',
      phone: '',
      positionId: undefined,
      realName: '',
      status: 'enabled',
      username: '',
    })
    setIsEmployeeModalOpen(true)
  }

  const openEditModal = (employee: Employee) => {
    setEditingEmployee(employee)
    employeeForm.setFieldsValue({
      departmentId: employee.departmentId,
      email: employee.email,
      employeeNo: employee.employeeNo,
      password: '',
      phone: employee.phone,
      positionId: employee.positionId,
      realName: employee.realName,
      status: employee.status,
      username: employee.username,
    })
    setIsEmployeeModalOpen(true)
  }

  const openAssignModal = (employee: Employee) => {
    setSelectedEmployee(employee)
    roleForm.setFieldsValue({
      roleIds: employee.roleIds ?? [],
    })
    setIsAssignModalOpen(true)
  }

  const handleFilter = async () => {
    await loadEmployees(filterForm.getFieldsValue())
  }

  const handleResetFilter = async () => {
    filterForm.resetFields()
    await loadEmployees()
  }

  const handleSaveEmployee = async () => {
    const values = await employeeForm.validateFields()
    const request: EmployeeRequest = {
      ...values,
      password: values.password?.trim() || undefined,
    }
    setIsSubmitting(true)

    try {
      if (editingEmployee) {
        await employeeApi.updateEmployee(editingEmployee.id, request)
        message.success('员工已更新')
      } else {
        await employeeApi.createEmployee(request)
        message.success('员工已创建')
      }

      setIsEmployeeModalOpen(false)
      await loadEmployees(filterForm.getFieldsValue())
    } catch (error) {
      message.error(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (employee: Employee) => {
    try {
      await employeeApi.deleteEmployee(employee.id)
      message.success('员工已删除')
      await loadEmployees(filterForm.getFieldsValue())
    } catch (error) {
      message.error(getErrorMessage(error))
    }
  }

  const handleAssignRoles = async () => {
    if (!selectedEmployee) {
      return
    }

    const values = await roleForm.validateFields()
    setIsSubmitting(true)

    try {
      await employeeApi.assignRoles(selectedEmployee.id, values.roleIds)
      message.success('角色已分配')
      setIsAssignModalOpen(false)
      await loadEmployees(filterForm.getFieldsValue())
    } catch (error) {
      message.error(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  const columns: TableColumnsType<Employee> = [
    {
      dataIndex: 'employeeNo',
      title: '工号',
      width: 120,
    },
    {
      dataIndex: 'username',
      title: '用户名',
      width: 140,
    },
    {
      dataIndex: 'realName',
      title: '姓名',
      width: 120,
    },
    {
      dataIndex: 'departmentName',
      title: '部门',
      render: (value: string | undefined, record) =>
        value || departments.find((department) => department.id === record.departmentId)?.name || '-',
    },
    {
      dataIndex: 'positionName',
      title: '岗位',
      render: (value: string | undefined, record) =>
        value || positions.find((position) => position.id === record.positionId)?.name || '-',
    },
    {
      dataIndex: 'phone',
      title: '手机号',
      render: (value: string | undefined) => value || '-',
    },
    {
      dataIndex: 'email',
      title: '邮箱',
      render: (value: string | undefined) => value || '-',
    },
    {
      dataIndex: 'roleNames',
      title: '角色',
      render: (value: string[] | undefined, record) => {
        const names =
          value?.length ? value : record.roleIds?.map((roleId) => roleNameMap.get(roleId)).filter(Boolean)

        return names?.length ? names.join('、') : '-'
      },
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
      width: 220,
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => openEditModal(record)}>
            编辑
          </Button>
          <Button type="link" onClick={() => openAssignModal(record)}>
            分配角色
          </Button>
          <Popconfirm
            title="确认删除该员工？"
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
          员工管理
        </Title>
        <Button type="primary" onClick={openCreateModal}>
          新增员工
        </Button>
      </Space>
      <Form<EmployeeQuery> form={filterForm} layout="inline" style={{ marginBottom: 16 }}>
        <Form.Item name="keyword">
          <Input allowClear placeholder="用户名 / 姓名 / 工号" style={{ width: 200 }} />
        </Form.Item>
        <Form.Item name="departmentId">
          <Select allowClear options={departmentOptions} placeholder="部门" style={{ width: 160 }} />
        </Form.Item>
        <Form.Item name="positionId">
          <Select allowClear options={positionOptions} placeholder="岗位" style={{ width: 160 }} />
        </Form.Item>
        <Form.Item name="status">
          <Select allowClear options={statusOptions} placeholder="状态" style={{ width: 120 }} />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" onClick={handleFilter}>
              查询
            </Button>
            <Button onClick={handleResetFilter}>重置</Button>
          </Space>
        </Form.Item>
      </Form>
      {errorMessage ? <Alert showIcon type="error" message={errorMessage} style={{ marginBottom: 16 }} /> : null}
      <Table
        columns={columns}
        dataSource={employees}
        loading={isLoading}
        pagination={false}
        rowKey="id"
        scroll={{ x: 1200 }}
      />
      <Modal
        title={editingEmployee ? '编辑员工' : '新增员工'}
        open={isEmployeeModalOpen}
        okText="保存"
        confirmLoading={isSubmitting}
        onCancel={() => setIsEmployeeModalOpen(false)}
        onOk={handleSaveEmployee}
      >
        <Form<EmployeeFormValues> form={employeeForm} layout="vertical">
          <Form.Item label="用户名" name="username" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input autoComplete="username" maxLength={50} />
          </Form.Item>
          <Form.Item label="姓名" name="realName" rules={[{ required: true, message: '请输入姓名' }]}>
            <Input maxLength={50} />
          </Form.Item>
          <Form.Item label="工号" name="employeeNo" rules={[{ required: true, message: '请输入工号' }]}>
            <Input maxLength={50} />
          </Form.Item>
          <Form.Item
            label="密码"
            name="password"
            rules={editingEmployee ? [] : [{ required: true, message: '请输入初始密码' }]}
            extra={editingEmployee ? '留空则不修改密码' : undefined}
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>
          <Form.Item label="部门" name="departmentId">
            <Select allowClear options={departmentOptions} placeholder="请选择部门" />
          </Form.Item>
          <Form.Item label="岗位" name="positionId">
            <Select allowClear options={positionOptions} placeholder="请选择岗位" />
          </Form.Item>
          <Form.Item label="手机号" name="phone">
            <Input maxLength={30} />
          </Form.Item>
          <Form.Item label="邮箱" name="email" rules={[{ type: 'email', message: '请输入正确的邮箱地址' }]}>
            <Input maxLength={100} />
          </Form.Item>
          <Form.Item label="状态" name="status" rules={[{ required: true, message: '请选择状态' }]}>
            <Select options={statusOptions} />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title={selectedEmployee ? `分配角色：${selectedEmployee.realName}` : '分配角色'}
        open={isAssignModalOpen}
        okText="保存"
        confirmLoading={isSubmitting}
        onCancel={() => setIsAssignModalOpen(false)}
        onOk={handleAssignRoles}
      >
        <Form form={roleForm} layout="vertical">
          <Form.Item label="角色" name="roleIds" initialValue={[]}>
            <Select mode="multiple" options={roleOptions} placeholder="请选择角色" />
          </Form.Item>
        </Form>
      </Modal>
    </section>
  )
}

export default Employees
