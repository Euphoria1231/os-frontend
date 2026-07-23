import { memo, useState } from 'react'
import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FormOutlined,
  PlusOutlined,
  ReloadOutlined,
  StopOutlined,
} from '@ant-design/icons'
import {
  Alert,
  App,
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Statistic,
  Table,
  Typography,
  type TableProps,
} from 'antd'
import dayjs, { type Dayjs } from 'dayjs'
import { ApplicationStatusTag, ApplicationTypeTag } from '../../components/flow/FlowTags.tsx'
import { PageHeader } from '../../components/common/PageHeader.tsx'
import { useAuth } from '../../hooks/auth/useAuth.ts'
import { useApplications } from '../../hooks/flow/useApplications.ts'
import { attendanceService } from '../../services/attendance/attendance.service.ts'
import type {
  AttendanceRecord,
  MakeupQuota,
} from '../../services/attendance/attendance.types.ts'
import type {
  ApplicationType,
  FlowApplication,
} from '../../services/flow/flow.types.ts'
import { RequestError } from '../../services/request.ts'
import { formatDateTime } from '../../utils/date.ts'
import { getErrorMessage } from '../../utils/error.ts'
import './FlowPage.less'

interface ApplicationFormValues {
  applicationType: ApplicationType
  timeRange?: [Dayjs, Dayjs]
  makeupMonth: Dayjs
  attendanceRecordId?: number
  reason: string
}

function getDefaultValues(): ApplicationFormValues {
  const targetDate = dayjs().add(1, 'day')
  return {
    applicationType: 'LEAVE',
    timeRange: [
      targetDate.hour(9).minute(0).second(0).millisecond(0),
      targetDate.hour(18).minute(0).second(0).millisecond(0),
    ],
    makeupMonth: dayjs().startOf('month'),
    reason: '',
  }
}

async function getMakeupQuotaOrNull(quotaMonth: string): Promise<MakeupQuota | null> {
  try {
    return await attendanceService.getMyMakeupQuota(quotaMonth)
  } catch (error) {
    if (error instanceof RequestError && error.code === 40401) {
      return null
    }
    throw error
  }
}

function formatClockTime(value: string | null): string {
  return value ? dayjs(value).format('HH:mm:ss') : '未打卡'
}

function formatDuration(startTime: string | null, endTime: string | null): string {
  if (!startTime || !endTime) return '—'
  const minutes = dayjs(endTime).diff(dayjs(startTime), 'minute')
  if (minutes < 60) return `${minutes} 分钟`
  const hours = Math.floor(minutes / 60)
  return minutes % 60 ? `${hours} 小时 ${minutes % 60} 分钟` : `${hours} 小时`
}

export const ApplicationPage = memo(function ApplicationPage() {
  const [form] = Form.useForm<ApplicationFormValues>()
  const [modalOpen, setModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [makeupRecords, setMakeupRecords] = useState<AttendanceRecord[]>([])
  const [makeupQuota, setMakeupQuota] = useState<MakeupQuota | null>()
  const [makeupLoading, setMakeupLoading] = useState(false)
  const [makeupError, setMakeupError] = useState<unknown>(null)
  const { message } = App.useApp()
  const { hasAuthority } = useAuth()
  const {
    applications,
    loading,
    error,
    reload,
    submitApplication,
    submitMakeup,
  } = useApplications()
  const canSubmit = hasAuthority('POST:/api/flow/applications/**')
  const selectedApplicationType = Form.useWatch('applicationType', form) ?? 'LEAVE'

  const openModal = () => {
    form.setFieldsValue(getDefaultValues())
    setMakeupRecords([])
    setMakeupQuota(undefined)
    setMakeupError(null)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setMakeupRecords([])
    setMakeupQuota(undefined)
    setMakeupError(null)
    form.resetFields()
  }

  const loadMakeupOptions = async (quotaMonth: Dayjs) => {
    setMakeupLoading(true)
    setMakeupError(null)
    form.setFieldValue('attendanceRecordId', undefined)
    try {
      const month = quotaMonth.format('YYYY-MM')
      const [records, quota] = await Promise.all([
        attendanceService.listRecords({
          startDate: quotaMonth.startOf('month').format('YYYY-MM-DD'),
          endDate: quotaMonth.endOf('month').format('YYYY-MM-DD'),
        }),
        getMakeupQuotaOrNull(month),
      ])
      const activeRecordIds = new Set(
        applications
          .filter(
            (application) =>
              application.applicationType === 'MAKEUP'
              && application.attendanceRecordId !== null
              && (application.status === 'PENDING' || application.status === 'APPROVED'),
          )
          .map((application) => application.attendanceRecordId),
      )
      setMakeupRecords(
        records.filter(
          (record) => record.attendanceStatus === 'LATE' && !activeRecordIds.has(record.id),
        ),
      )
      setMakeupQuota(quota)
    } catch (requestError) {
      setMakeupRecords([])
      setMakeupQuota(undefined)
      setMakeupError(requestError)
    } finally {
      setMakeupLoading(false)
    }
  }

  const handleApplicationTypeChange = (type: ApplicationType) => {
    if (type !== 'MAKEUP') {
      return
    }
    const quotaMonth = form.getFieldValue('makeupMonth') ?? dayjs().startOf('month')
    form.setFieldValue('makeupMonth', quotaMonth)
    void loadMakeupOptions(quotaMonth)
  }

  const handleSubmit = async (values: ApplicationFormValues) => {
    setSubmitting(true)
    try {
      if (values.applicationType === 'MAKEUP') {
        if (!values.attendanceRecordId) {
          return
        }
        await submitMakeup({
          attendanceRecordId: values.attendanceRecordId,
          reason: values.reason.trim(),
        })
        message.success('补签申请已提交')
      } else {
        if (!values.timeRange) {
          return
        }
        await submitApplication(values.applicationType, {
          startTime: values.timeRange[0].format('YYYY-MM-DDTHH:mm:ss'),
          endTime: values.timeRange[1].format('YYYY-MM-DDTHH:mm:ss'),
          reason: values.reason.trim(),
        })
        message.success(values.applicationType === 'LEAVE' ? '请假申请已提交' : '加班申请已提交')
      }
      closeModal()
    } catch (requestError) {
      message.error(getErrorMessage(requestError, '申请提交失败'))
    } finally {
      setSubmitting(false)
    }
  }

  const columns: TableProps<FlowApplication>['columns'] = [
    {
      title: '申请单',
      dataIndex: 'applicationNo',
      key: 'applicationNo',
      width: 190,
      render: (applicationNo: string, application) => (
        <div className="flow-primary-cell">
          <Typography.Text strong>{applicationNo}</Typography.Text>
          <ApplicationTypeTag type={application.applicationType} />
        </div>
      ),
    },
    {
      title: '申请内容',
      key: 'timeRange',
      width: 250,
      render: (_, application) =>
        application.applicationType === 'MAKEUP' ? (
          <div className="flow-time-cell">
            <Typography.Text>考勤记录 #{application.attendanceRecordId ?? '—'}</Typography.Text>
            <Typography.Text type="secondary">迟到补签</Typography.Text>
          </div>
        ) : (
          <div className="flow-time-cell">
            <Typography.Text>{formatDateTime(application.startTime)}</Typography.Text>
            <Typography.Text type="secondary">至 {formatDateTime(application.endTime)}</Typography.Text>
          </div>
        ),
    },
    {
      title: '时长',
      key: 'duration',
      width: 130,
      render: (_, application) => formatDuration(application.startTime, application.endTime),
    },
    {
      title: '申请原因',
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: true,
    },
    {
      title: '审批人',
      dataIndex: 'approverId',
      key: 'approverId',
      width: 100,
      render: (approverId: number) => `员工 ${approverId}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (status: FlowApplication['status']) => <ApplicationStatusTag status={status} />,
    },
    {
      title: '提交时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 170,
      render: formatDateTime,
    },
  ]

  const pendingCount = applications.filter((item) => item.status === 'PENDING').length
  const approvedCount = applications.filter((item) => item.status === 'APPROVED').length
  const rejectedCount = applications.filter((item) => item.status === 'REJECTED').length
  const makeupSubmitDisabled = selectedApplicationType === 'MAKEUP'
    && (makeupLoading || !makeupQuota || makeupQuota.remainingCount <= 0 || makeupRecords.length === 0)

  return (
    <section className="flow-page">
      <PageHeader
        title="我的申请"
        description=""
        extra={
          canSubmit ? (
            <Button type="primary" icon={<PlusOutlined />} onClick={openModal}>
              发起申请
            </Button>
          ) : null
        }
      />

      <Row gutter={[14, 14]} className="flow-stats">
        <Col xs={24} sm={8}>
          <Card bordered={false}><Statistic title="审批中" value={pendingCount} suffix="单" prefix={<ClockCircleOutlined />} /></Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false}><Statistic title="已同意" value={approvedCount} suffix="单" prefix={<CheckCircleOutlined />} /></Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false}><Statistic title="已驳回" value={rejectedCount} suffix="单" prefix={<StopOutlined />} /></Card>
        </Col>
      </Row>

      {Boolean(error) && (
        <Alert
          className="flow-alert"
          type="warning"
          showIcon
          message="申请数据暂时无法加载"
          description={getErrorMessage(error, '请稍后重试')}
          action={<Button size="small" icon={<ReloadOutlined />} onClick={() => void reload()}>重新加载</Button>}
        />
      )}

      <Card bordered={false} className="flow-table-card">
        <div className="flow-table-toolbar">
          <div>
            <Typography.Title level={4}>申请记录</Typography.Title>
          </div>
          <Button type="text" icon={<ReloadOutlined />} loading={loading} onClick={() => void reload()}>
            刷新
          </Button>
        </div>
        <Table<FlowApplication>
          rowKey="id"
          columns={columns}
          dataSource={applications}
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条申请` }}
          scroll={{ x: 1100 }}
        />
      </Card>

      <Modal title="发起申请" open={modalOpen} onCancel={closeModal} footer={null} width={720}>
        <Form<ApplicationFormValues>
          form={form}
          layout="vertical"
          initialValues={getDefaultValues()}
          onFinish={handleSubmit}
          requiredMark="optional"
        >
          <Form.Item label="申请类型" name="applicationType" rules={[{ required: true }]}> 
            <Select
              onChange={handleApplicationTypeChange}
              options={[
                { label: '请假申请', value: 'LEAVE' },
                { label: '加班申请', value: 'OVERTIME' },
                { label: '补签申请', value: 'MAKEUP' },
              ]}
            />
          </Form.Item>
          {selectedApplicationType === 'MAKEUP' ? (
            <div className="flow-makeup-fields">
              <Row gutter={14}>
                <Col xs={24} sm={10}>
                  <Form.Item
                    label="补签月份"
                    name="makeupMonth"
                    rules={[{ required: true, message: '请选择补签月份' }]}
                  >
                    <DatePicker
                      picker="month"
                      format="YYYY-MM"
                      allowClear={false}
                      style={{ width: '100%' }}
                      onChange={(month) => {
                        if (month) {
                          void loadMakeupOptions(month)
                        }
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={14}>
                  <Form.Item
                    label="迟到考勤记录"
                    name="attendanceRecordId"
                    rules={[{ required: true, message: '请选择需要补签的迟到记录' }]}
                  >
                    <Select
                      showSearch
                      optionFilterProp="label"
                      loading={makeupLoading}
                      disabled={!makeupQuota || makeupQuota.remainingCount <= 0}
                      placeholder="请选择迟到记录"
                      notFoundContent={
                        <Typography.Text type="secondary">
                          本月没有可申请补签的迟到记录
                        </Typography.Text>
                      }
                      options={makeupRecords.map((record) => ({
                        value: record.id,
                        label: `${dayjs(record.attendanceDate).format('YYYY-MM-DD')}`
                          + ` · 上班 ${formatClockTime(record.clockInTime)}`,
                      }))}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Alert
                className="flow-makeup-quota-alert"
                showIcon
                icon={<FormOutlined />}
                type={
                  makeupError || makeupQuota === null || makeupQuota?.remainingCount === 0
                    ? 'warning'
                    : 'info'
                }
                message={
                  makeupLoading
                    ? '正在加载本月补签记录与额度'
                    : makeupError
                      ? '补签数据暂时无法加载'
                      : makeupQuota
                        ? `本月剩余 ${makeupQuota.remainingCount} 次补签机会`
                        : '直属领导尚未配置本月补签额度'
                }
                description={
                  makeupError
                    ? getErrorMessage(makeupError, '请稍后重新选择月份')
                    : makeupQuota
                      ? `总额度 ${makeupQuota.totalCount} 次，已使用 ${makeupQuota.usedCount} 次。只显示尚无有效补签申请的迟到记录。`
                      : '请联系直属领导在员工管理中配置额度后再提交。'
                }
              />
            </div>
          ) : (
            <Form.Item
              label="起止时间"
              name="timeRange"
              rules={[
                { required: true, message: '请选择起止时间' },
                {
                  validator: (_, value?: [Dayjs, Dayjs]) =>
                    value?.[1].isAfter(value[0])
                      ? Promise.resolve()
                      : Promise.reject(new Error('结束时间必须晚于开始时间')),
                },
              ]}
            >
              <DatePicker.RangePicker
                showTime={{ format: 'HH:mm' }}
                format="YYYY-MM-DD HH:mm"
                style={{ width: '100%' }}
                suffixIcon={<CalendarOutlined />}
              />
            </Form.Item>
          )}
          <Form.Item
            label={selectedApplicationType === 'MAKEUP' ? '补签原因' : '申请原因'}
            name="reason"
            rules={[
              {
                required: true,
                whitespace: true,
                message: selectedApplicationType === 'MAKEUP' ? '请输入补签原因' : '请输入申请原因',
              },
              { max: 500, message: '申请原因不能超过 500 个字符' },
            ]}
          >
            <Input.TextArea
              rows={5}
              maxLength={500}
              showCount
              placeholder={selectedApplicationType === 'MAKEUP'
                ? '请说明本次迟到和补签原因'
                : '说明申请原因和必要背景'}
            />
          </Form.Item>
          <div className="flow-form-actions">
            <Button onClick={closeModal}>取消</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              disabled={makeupSubmitDisabled}
            >
              提交申请
            </Button>
          </div>
        </Form>
      </Modal>
    </section>
  )
})
