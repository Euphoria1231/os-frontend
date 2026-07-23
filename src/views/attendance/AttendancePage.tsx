import { memo, useEffect, useState } from 'react'
import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FormOutlined,
  LoginOutlined,
  LogoutOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import {
  Alert,
  App,
  Button,
  Card,
  Col,
  DatePicker,
  Descriptions,
  Form,
  Input,
  Modal,
  Row,
  Space,
  Statistic,
  Table,
  Tag,
  Tooltip,
  Typography,
  type TableProps,
} from 'antd'
import dayjs, { type Dayjs } from 'dayjs'
import { AttendanceStatusTag } from '../../components/attendance/AttendanceStatusTag.tsx'
import { PageHeader } from '../../components/common/PageHeader.tsx'
import { useAttendance } from '../../hooks/attendance/useAttendance.ts'
import { useAuth } from '../../hooks/auth/useAuth.ts'
import { useApplications } from '../../hooks/flow/useApplications.ts'
import { attendanceService } from '../../services/attendance/attendance.service.ts'
import type {
  AttendanceRecord,
  MakeupQuota,
} from '../../services/attendance/attendance.types.ts'
import { RequestError } from '../../services/request.ts'
import { formatDateTime } from '../../utils/date.ts'
import { getErrorMessage } from '../../utils/error.ts'
import {
  buildMakeupApplicationRequest,
  resolveMakeupActionState,
} from './makeup.logic.ts'
import './AttendancePage.less'

const { RangePicker } = DatePicker

function formatTime(value: string | null): string {
  return value ? dayjs(value).format('HH:mm:ss') : '--:--:--'
}

function getWorkDuration(record: AttendanceRecord): string {
  if (!record.clockInTime || !record.clockOutTime) {
    return '—'
  }
  const minutes = dayjs(record.clockOutTime).diff(dayjs(record.clockInTime), 'minute')
  const hours = Math.floor(minutes / 60)
  return `${hours}小时${minutes % 60}分钟`
}

interface MakeupFormValues {
  reason: string
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

export const AttendancePage = memo(function AttendancePage() {
  const [makeupForm] = Form.useForm<MakeupFormValues>()
  const [now, setNow] = useState(() => new Date())
  const [range, setRange] = useState<[Dayjs, Dayjs]>(() => [
    dayjs().startOf('month'),
    dayjs().endOf('month'),
  ])
  const [submitting, setSubmitting] = useState<'in' | 'out' | null>(null)
  const [makeupTarget, setMakeupTarget] = useState<AttendanceRecord | null>(null)
  const [makeupModalOpen, setMakeupModalOpen] = useState(false)
  const [makeupSubmitting, setMakeupSubmitting] = useState(false)
  const [makeupQuotaLoading, setMakeupQuotaLoading] = useState(true)
  const [quotaError, setQuotaError] = useState<unknown>(null)
  const [quotaByMonth, setQuotaByMonth] = useState<Record<string, MakeupQuota | null>>({})
  const { message } = App.useApp()
  const { user, hasAuthority } = useAuth()
  const { today, records, loading, error, reload, clockIn, clockOut } = useAttendance(
    range[0].format('YYYY-MM-DD'),
    range[1].format('YYYY-MM-DD'),
  )
  const {
    applications,
    loading: applicationsLoading,
    error: applicationsError,
    reload: reloadApplications,
    submitMakeup,
  } = useApplications()
  const canClock = hasAuthority('POST:/api/attendance/**')
  const canSubmitMakeup = hasAuthority('POST:/api/flow/applications/**')
  const currentMonth = dayjs(now).format('YYYY-MM')
  const currentQuota = quotaByMonth[currentMonth]
  const makeupTargetMonth = makeupTarget
    ? dayjs(makeupTarget.attendanceDate).format('YYYY-MM')
    : currentMonth
  const targetQuota = quotaByMonth[makeupTargetMonth]

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    let active = true
    setMakeupQuotaLoading(true)

    getMakeupQuotaOrNull(currentMonth)
      .then((quota) => {
        if (active) {
          setQuotaByMonth((current) => ({ ...current, [currentMonth]: quota }))
          setQuotaError(null)
        }
      })
      .catch((requestError: unknown) => {
        if (active) {
          setQuotaError(requestError)
        }
      })
      .finally(() => {
        if (active) {
          setMakeupQuotaLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [currentMonth])

  const handleClockIn = async () => {
    setSubmitting('in')
    try {
      const record = await clockIn()
      message.success(`上班打卡成功：${formatTime(record.clockInTime)}`)
    } catch (requestError) {
      message.error(getErrorMessage(requestError, '上班打卡失败'))
    } finally {
      setSubmitting(null)
    }
  }

  const handleClockOut = async () => {
    setSubmitting('out')
    try {
      const record = await clockOut()
      message.success(`下班打卡成功：${formatTime(record.clockOutTime)}`)
    } catch (requestError) {
      message.error(getErrorMessage(requestError, '下班打卡失败'))
    } finally {
      setSubmitting(null)
    }
  }

  const loadMakeupQuota = async (quotaMonth: string) => {
    setMakeupQuotaLoading(true)
    try {
      const quota = await getMakeupQuotaOrNull(quotaMonth)
      setQuotaByMonth((current) => ({ ...current, [quotaMonth]: quota }))
      setQuotaError(null)
      return quota
    } catch (requestError) {
      setQuotaError(requestError)
      throw requestError
    } finally {
      setMakeupQuotaLoading(false)
    }
  }

  const openMakeupModal = async (record: AttendanceRecord) => {
    const quotaMonth = dayjs(record.attendanceDate).format('YYYY-MM')
    setMakeupTarget(record)
    makeupForm.setFieldsValue({ reason: '' })
    setMakeupModalOpen(true)
    try {
      await loadMakeupQuota(quotaMonth)
    } catch (requestError) {
      message.error(getErrorMessage(requestError, '补签额度查询失败'))
    }
  }

  const closeMakeupModal = () => {
    setMakeupModalOpen(false)
    setMakeupTarget(null)
    makeupForm.resetFields()
  }

  const handleMakeupSubmit = async (values: MakeupFormValues) => {
    if (!makeupTarget || !targetQuota || targetQuota.remainingCount <= 0) {
      message.warning('当前月份没有可用补签次数')
      return
    }

    setMakeupSubmitting(true)
    try {
      await submitMakeup(buildMakeupApplicationRequest(makeupTarget.id, values.reason))
      message.success('补签申请已提交，等待直属领导审批')
      closeMakeupModal()
    } catch (requestError) {
      message.error(getErrorMessage(requestError, '补签申请提交失败'))
      await reloadApplications()
    } finally {
      setMakeupSubmitting(false)
    }
  }

  const handleReload = async () => {
    await Promise.allSettled([
      reload(),
      reloadApplications(),
      loadMakeupQuota(currentMonth),
    ])
  }

  const columns: TableProps<AttendanceRecord>['columns'] = [
    {
      title: '日期',
      dataIndex: 'attendanceDate',
      key: 'attendanceDate',
      render: (date: string) => (
        <div className="attendance-date-cell">
          <Typography.Text strong>{dayjs(date).format('MM 月 DD 日')}</Typography.Text>
          <Typography.Text type="secondary">{dayjs(date).format('dddd')}</Typography.Text>
        </div>
      ),
    },
    {
      title: '上班打卡',
      dataIndex: 'clockInTime',
      key: 'clockInTime',
      render: formatDateTime,
    },
    {
      title: '下班打卡',
      dataIndex: 'clockOutTime',
      key: 'clockOutTime',
      render: formatDateTime,
    },
    {
      title: '工作时长',
      key: 'duration',
      render: (_, record) => getWorkDuration(record),
    },
    {
      title: '考勤状态',
      dataIndex: 'attendanceStatus',
      key: 'attendanceStatus',
      width: 110,
      render: (status: AttendanceRecord['attendanceStatus']) => <AttendanceStatusTag status={status} />,
    },
    {
      title: '操作',
      key: 'actions',
      width: 120,
      render: (_, record) => {
        const quotaMonth = dayjs(record.attendanceDate).format('YYYY-MM')
        const recordQuota = quotaByMonth[quotaMonth]
        const hasActiveApplication = applications.some(
          (application) =>
            application.applicationType === 'MAKEUP'
            && application.attendanceRecordId === record.id
            && (application.status === 'PENDING' || application.status === 'APPROVED'),
        )
        const actionState = resolveMakeupActionState({
          attendanceStatus: record.attendanceStatus,
          canSubmit: canSubmitMakeup,
          hasActiveApplication,
          remainingCount: recordQuota === null ? null : recordQuota?.remainingCount,
        })

        if (actionState === 'HIDDEN') return <Typography.Text type="secondary">—</Typography.Text>
        if (actionState === 'COMPLETED') return <Tag color="cyan">已补签</Tag>
        if (actionState === 'PENDING') return <Tag color="processing">审批中</Tag>

        const unavailable = actionState === 'UNAVAILABLE'
        const unavailableMessage = recordQuota === null
          ? '直属领导尚未配置该月补签额度'
          : '该月补签额度已用完'
        return (
          <Tooltip title={unavailable ? unavailableMessage : '提交后由直属领导审批'}>
            <span>
              <Button
                type="link"
                size="small"
                disabled={unavailable}
                onClick={() => void openMakeupModal(record)}
              >
                申请补签
              </Button>
            </span>
          </Tooltip>
        )
      },
    },
  ]

  const lateCount = records.filter((record) => record.attendanceStatus === 'LATE').length
  const completedCount = records.filter((record) => record.clockInTime && record.clockOutTime).length
  const pageError = error ?? applicationsError ?? quotaError
  const dateLabel = new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(now)

  return (
    <section className="attendance-page">
      <PageHeader
        title="考勤打卡"
        description=""
      />

      <section className="attendance-clock-card">
        <div className="attendance-clock-copy">
          <Tag bordered={false}>TODAY · {dateLabel}</Tag>
          <Typography.Title>{dayjs(now).format('HH:mm:ss')}</Typography.Title>
          <Typography.Paragraph>
            {user?.realName ?? '当前员工'}，
            {!today?.clockInTime
              ? '今天还没有开始考勤。'
              : !today.clockOutTime
                ? '上班打卡已完成，记得下班打卡。'
                : '今天的上下班打卡均已完成。'}
          </Typography.Paragraph>
        </div>

        <div className="attendance-today-status">
          <div>
            <span><LoginOutlined /></span>
            <Typography.Text>上班时间</Typography.Text>
            <Typography.Title level={4}>{formatTime(today?.clockInTime ?? null)}</Typography.Title>
          </div>
          <i />
          <div>
            <span><LogoutOutlined /></span>
            <Typography.Text>下班时间</Typography.Text>
            <Typography.Title level={4}>{formatTime(today?.clockOutTime ?? null)}</Typography.Title>
          </div>
        </div>

        {canClock && (
          <Space className="attendance-clock-actions" size={12}>
            <Button
              type="primary"
              size="large"
              icon={<LoginOutlined />}
              disabled={Boolean(today?.clockInTime)}
              loading={submitting === 'in'}
              onClick={() => void handleClockIn()}
            >
              上班打卡
            </Button>
            <Button
              size="large"
              icon={<LogoutOutlined />}
              disabled={!today?.clockInTime || Boolean(today.clockOutTime)}
              loading={submitting === 'out'}
              onClick={() => void handleClockOut()}
            >
              下班打卡
            </Button>
          </Space>
        )}
      </section>

      <Row gutter={[14, 14]} className="attendance-stats">
        <Col xs={24} sm={12} xl={6}>
          <Card bordered={false}>
            <Statistic title="区间出勤" value={records.length} suffix="天" prefix={<CalendarOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card bordered={false}>
            <Statistic title="完整打卡" value={completedCount} suffix="天" prefix={<CheckCircleOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card bordered={false}>
            <Statistic title="迟到记录" value={lateCount} suffix="次" prefix={<ClockCircleOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card bordered={false} className="attendance-quota-card">
            <Statistic
              title={`${currentMonth} 补签剩余`}
              value={makeupQuotaLoading ? '—' : (currentQuota?.remainingCount ?? '—')}
              suffix={currentQuota ? '次' : undefined}
              prefix={<FormOutlined />}
            />
            <Typography.Text type="secondary">
              {makeupQuotaLoading
                ? '正在查询额度'
                : currentQuota
                  ? `共 ${currentQuota.totalCount} 次 · 已用 ${currentQuota.usedCount} 次`
                  : currentQuota === null
                    ? '直属领导暂未配置'
                    : '额度暂不可用'}
            </Typography.Text>
          </Card>
        </Col>
      </Row>

      {Boolean(pageError) && (
        <Alert
          className="attendance-alert"
          type="warning"
          showIcon
          message="部分考勤或补签数据暂时无法加载"
          description={getErrorMessage(pageError, '请稍后重试')}
          action={<Button size="small" icon={<ReloadOutlined />} onClick={() => void handleReload()}>重新加载</Button>}
        />
      )}

      <Card bordered={false} className="attendance-record-card">
        <div className="attendance-record-toolbar">
          <div>
            <Typography.Title level={4}>个人打卡记录</Typography.Title>
          </div>
          <Space wrap>
            <RangePicker
              allowClear={false}
              value={range}
              onChange={(dates) => {
                if (dates?.[0] && dates[1]) {
                  setRange([dates[0], dates[1]])
                }
              }}
            />
            <Button
              type="text"
              icon={<ReloadOutlined />}
              loading={loading || applicationsLoading || makeupQuotaLoading}
              onClick={() => void handleReload()}
            >
              刷新
            </Button>
          </Space>
        </div>
        <Table<AttendanceRecord>
          rowKey="id"
          columns={columns}
          dataSource={records}
          loading={loading || applicationsLoading}
          pagination={{ pageSize: 10, showTotal: (total) => `共 ${total} 条记录` }}
          scroll={{ x: 940 }}
        />
      </Card>

      <Modal
        title="申请补签"
        open={makeupModalOpen}
        onCancel={closeMakeupModal}
        footer={null}
        width={620}
      >
        <div className="attendance-makeup-summary">
          <Descriptions
            size="small"
            column={2}
            items={[
              {
                key: 'date',
                label: '考勤日期',
                children: makeupTarget
                  ? dayjs(makeupTarget.attendanceDate).format('YYYY-MM-DD')
                  : '—',
              },
              {
                key: 'clockIn',
                label: '上班打卡',
                children: formatTime(makeupTarget?.clockInTime ?? null),
              },
              {
                key: 'record',
                label: '考勤记录',
                children: makeupTarget ? `#${makeupTarget.id}` : '—',
              },
              {
                key: 'month',
                label: '额度月份',
                children: makeupTargetMonth,
              },
            ]}
          />
        </div>

        <Alert
          className="attendance-makeup-quota-alert"
          showIcon
          type={targetQuota && targetQuota.remainingCount > 0 ? 'success' : 'warning'}
          message={
            makeupQuotaLoading
              ? '正在查询补签额度'
              : targetQuota
                ? targetQuota.remainingCount > 0
                  ? `本月还可补签 ${targetQuota.remainingCount} 次`
                  : '本月补签额度已用完'
                : targetQuota === null
                  ? '直属领导尚未配置本月补签额度'
                  : '补签额度查询失败'
          }
          description={
            targetQuota
              ? `总额度 ${targetQuota.totalCount} 次，已使用 ${targetQuota.usedCount} 次。`
              : '补签额度由直属领导按月指定。'
          }
        />

        <Form<MakeupFormValues>
          form={makeupForm}
          layout="vertical"
          onFinish={handleMakeupSubmit}
          requiredMark="optional"
        >
          <Form.Item
            label="补签原因"
            name="reason"
            rules={[
              { required: true, whitespace: true, message: '请输入补签原因' },
              { max: 500, message: '补签原因不能超过 500 个字符' },
            ]}
          >
            <Input.TextArea
              rows={4}
              maxLength={500}
              showCount
              placeholder="请说明迟到原因，提交后由直属领导审批"
            />
          </Form.Item>
          <div className="attendance-makeup-actions">
            <Button onClick={closeMakeupModal}>取消</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={makeupSubmitting}
              disabled={makeupQuotaLoading || !targetQuota || targetQuota.remainingCount <= 0}
            >
              提交补签申请
            </Button>
          </div>
        </Form>
      </Modal>
    </section>
  )
})
