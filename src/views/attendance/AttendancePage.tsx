import { memo, useEffect, useRef, useState } from 'react'
import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  FormOutlined,
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
import { useSearchParams } from 'react-router-dom'
import { AttendanceStatusTag } from '../../components/attendance/AttendanceStatusTag.tsx'
import { PageHeader } from '../../components/common/PageHeader.tsx'
import { useAttendance } from '../../hooks/attendance/useAttendance.ts'
import { useAuth } from '../../hooks/auth/useAuth.ts'
import { useApplications } from '../../hooks/flow/useApplications.ts'
import { attendanceService } from '../../services/attendance/attendance.service.ts'
import type {
  AttendanceRecord,
  ClockLocation,
  MakeupQuota,
} from '../../services/attendance/attendance.types.ts'
import { RequestError } from '../../services/request.ts'
import { formatDateTime } from '../../utils/date.ts'
import { getErrorMessage } from '../../utils/error.ts'
import {
  calculateDistanceMeters,
  formatClockTime,
  hasAttendanceDateChanged,
  isInsideGeofence,
  resolveClockAction,
  type ClockAction,
} from './clock.logic.ts'
import {
  buildMakeupApplicationRequest,
  resolveMakeupActionState,
} from './makeup.logic.ts'
import './AttendancePage.less'

const { RangePicker } = DatePicker

function formatTime(value: string | null): string {
  return value ? dayjs(value).format('HH:mm:ss') : '--:--:--'
}

function getClockInterval(record: AttendanceRecord): string {
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

type LocationStatus = 'idle' | 'locating' | 'inside' | 'outside' | 'error'

interface ClockLocationState {
  status: LocationStatus
  point: ClockLocation | null
  accuracyMeters: number | null
  distanceMeters: number | null
  errorMessage: string | null
}

const INITIAL_LOCATION_STATE: ClockLocationState = {
  status: 'idle',
  point: null,
  accuracyMeters: null,
  distanceMeters: null,
  errorMessage: null,
}

const CLOCK_ACTION_LABELS: Record<ClockAction, string> = {
  MORNING_CLOCK: '上午打卡',
  WAITING_AFTERNOON: '下午打卡尚未开始',
  AFTERNOON_CLOCK: '下午打卡',
  COMPLETED: '今日打卡已完成',
}

const LOCATION_TITLES: Record<LocationStatus, string> = {
  idle: '准备获取当前位置',
  locating: '正在验证打卡位置',
  inside: '当前位置符合打卡范围',
  outside: '当前位置超出打卡范围',
  error: '暂时无法验证位置',
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
  const [searchParams] = useSearchParams()
  const [now, setNow] = useState(() => new Date())
  const attendanceDateRef = useRef(dayjs().format('YYYY-MM-DD'))
  const [range, setRange] = useState<[Dayjs, Dayjs]>(() => [
    dayjs().startOf('month'),
    dayjs().endOf('month'),
  ])
  const [submitting, setSubmitting] = useState<'morning' | 'afternoon' | null>(null)
  const [clockModalOpen, setClockModalOpen] = useState(false)
  const [locationState, setLocationState] = useState<ClockLocationState>(
    INITIAL_LOCATION_STATE,
  )
  const [makeupTarget, setMakeupTarget] = useState<AttendanceRecord | null>(null)
  const [makeupModalOpen, setMakeupModalOpen] = useState(false)
  const [makeupSubmitting, setMakeupSubmitting] = useState(false)
  const [makeupQuotaLoading, setMakeupQuotaLoading] = useState(true)
  const [quotaError, setQuotaError] = useState<unknown>(null)
  const [quotaByMonth, setQuotaByMonth] = useState<Record<string, MakeupQuota | null>>({})
  const { message } = App.useApp()
  const { user, hasAuthority } = useAuth()
  const {
    today,
    records,
    clockConfig,
    loading,
    error,
    reload,
    clockIn,
    clockOut,
  } = useAttendance(
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
  const afternoonClockStartTime = clockConfig?.afternoonClockStartTime ?? '13:30'
  const clockAction = resolveClockAction(
    today,
    dayjs(now).format('HH:mm'),
    afternoonClockStartTime,
  )
  const recordIdParam = searchParams.get('recordId')
  const parsedRecordId = Number(recordIdParam)
  const focusedRecordId = recordIdParam !== null
    && Number.isSafeInteger(parsedRecordId)
    && parsedRecordId > 0
    ? parsedRecordId
    : null
  const visibleRecords = focusedRecordId
    ? records.filter((record) => record.id === focusedRecordId)
    : records

  useEffect(() => {
    const timer = window.setInterval(() => {
      const nextNow = new Date()
      const nextDate = dayjs(nextNow).format('YYYY-MM-DD')
      if (hasAttendanceDateChanged(attendanceDateRef.current, nextDate)) {
        attendanceDateRef.current = nextDate
        void reload()
      }
      setNow(nextNow)
    }, 1000)
    return () => window.clearInterval(timer)
  }, [reload])

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

  const locateForClock = () => {
    if (!clockConfig) {
      setLocationState({
        ...INITIAL_LOCATION_STATE,
        status: 'error',
        errorMessage: '打卡配置尚未加载，请稍后重试',
      })
      return
    }
    if (!window.isSecureContext && window.location.hostname !== 'localhost') {
      setLocationState({
        ...INITIAL_LOCATION_STATE,
        status: 'error',
        errorMessage: '浏览器仅允许在 HTTPS 或 localhost 页面获取位置',
      })
      return
    }
    if (!navigator.geolocation) {
      setLocationState({
        ...INITIAL_LOCATION_STATE,
        status: 'error',
        errorMessage: '当前浏览器不支持位置定位',
      })
      return
    }

    setLocationState({ ...INITIAL_LOCATION_STATE, status: 'locating' })
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const point = {
          longitude: position.coords.longitude,
          latitude: position.coords.latitude,
        }
        const distanceMeters = calculateDistanceMeters(
          {
            longitude: clockConfig.centerLongitude,
            latitude: clockConfig.centerLatitude,
          },
          point,
        )
        setLocationState({
          status: isInsideGeofence(distanceMeters, clockConfig.radiusMeters)
            ? 'inside'
            : 'outside',
          point,
          accuracyMeters: position.coords.accuracy,
          distanceMeters,
          errorMessage: null,
        })
      },
      (positionError) => {
        const errorMessage = positionError.code === positionError.PERMISSION_DENIED
          ? '定位权限被拒绝，请在浏览器设置中允许位置访问'
          : positionError.code === positionError.TIMEOUT
            ? '定位超时，请移动到开阔区域后重试'
            : '暂时无法获取当前位置，请稍后重试'
        setLocationState({
          ...INITIAL_LOCATION_STATE,
          status: 'error',
          errorMessage,
        })
      },
      {
        enableHighAccuracy: true,
        timeout: 10_000,
        maximumAge: 0,
      },
    )
  }

  const openClockModal = () => {
    setClockModalOpen(true)
    locateForClock()
  }

  const closeClockModal = () => {
    if (submitting) return
    setClockModalOpen(false)
    setLocationState(INITIAL_LOCATION_STATE)
  }

  const handleClockSubmit = async () => {
    if (
      (clockAction !== 'MORNING_CLOCK' && clockAction !== 'AFTERNOON_CLOCK')
      || !locationState.point
      || locationState.status !== 'inside'
    ) return

    const isMorningClock = clockAction === 'MORNING_CLOCK'
    setSubmitting(isMorningClock ? 'morning' : 'afternoon')
    try {
      const record = isMorningClock
        ? await clockIn(locationState.point)
        : await clockOut(locationState.point)
      const clockTime = isMorningClock ? record.clockInTime : record.clockOutTime
      message.success(
        `${isMorningClock ? '上午' : '下午'}打卡成功：${formatTime(clockTime)}`,
      )
      setClockModalOpen(false)
      setLocationState(INITIAL_LOCATION_STATE)
    } catch (requestError) {
      message.error(
        getErrorMessage(requestError, `${isMorningClock ? '上午' : '下午'}打卡失败`),
      )
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
      title: '上午打卡',
      dataIndex: 'clockInTime',
      key: 'clockInTime',
      render: formatDateTime,
    },
    {
      title: '下午打卡',
      dataIndex: 'clockOutTime',
      key: 'clockOutTime',
      render: formatDateTime,
    },
    {
      title: '两次打卡间隔',
      key: 'duration',
      render: (_, record) => getClockInterval(record),
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
  const clockActionLabel = CLOCK_ACTION_LABELS[clockAction]
  const clockActionAvailable = clockAction === 'MORNING_CLOCK'
    || clockAction === 'AFTERNOON_CLOCK'
  const clockButtonLabel = clockAction === 'COMPLETED'
    ? '今日已完成'
    : clockAction === 'WAITING_AFTERNOON'
      ? `下午打卡 ${afternoonClockStartTime} 开放`
      : '考勤打卡'
  const clockStatusDescription = clockAction === 'MORNING_CLOCK'
    ? '上午尚未打卡。'
    : clockAction === 'WAITING_AFTERNOON'
      ? `上午打卡已完成，下午打卡将于 ${afternoonClockStartTime} 开放。`
      : clockAction === 'AFTERNOON_CLOCK'
        ? today?.clockInTime
          ? '已切换到下午场次，请完成下午打卡。'
          : '上午未打卡，当前仍可完成下午打卡。'
        : today?.clockInTime
          ? '今天的上午、下午打卡均已完成。'
          : '下午打卡已完成，上午未打卡。'
  const morningSchedule = clockConfig
    ? `${clockConfig.morningStartTime}–${clockConfig.morningEndTime}`
    : '09:00–12:00'
  const afternoonSchedule = clockConfig
    ? `${clockConfig.afternoonStartTime}–${clockConfig.afternoonEndTime}`
    : '14:00–17:00'
  const locationDescription = locationState.status === 'locating'
    ? '请保持页面开启，系统正在请求设备定位。'
    : locationState.status === 'inside' && locationState.distanceMeters !== null
      ? `距打卡中心约 ${Math.round(locationState.distanceMeters)} 米，可以提交打卡。`
      : locationState.status === 'outside' && locationState.distanceMeters !== null
        ? `距打卡中心约 ${Math.round(locationState.distanceMeters)} 米，请进入规定区域后重试。`
        : locationState.errorMessage ?? '点击重新定位以验证是否处于规定区域。'
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
            {user?.realName ?? '当前员工'}，{clockStatusDescription}
          </Typography.Paragraph>
        </div>

        <div className="attendance-time-board">
          <div className="attendance-time-row attendance-time-row-schedule">
            <div className="attendance-time-row-label">
              <span><ClockCircleOutlined /></span>
              <div>
                <Typography.Text>规定工作时间</Typography.Text>
                <Typography.Text type="secondary">每日固定时段</Typography.Text>
              </div>
            </div>
            <div className="attendance-time-slot">
              <Typography.Text>上午</Typography.Text>
              <Typography.Title level={4}>{morningSchedule}</Typography.Title>
            </div>
            <div className="attendance-time-slot">
              <Typography.Text>下午</Typography.Text>
              <Typography.Title level={4}>{afternoonSchedule}</Typography.Title>
            </div>
          </div>
          <div className="attendance-time-row">
            <div className="attendance-time-row-label">
              <span><CheckCircleOutlined /></span>
              <div>
                <Typography.Text>今日打卡时间</Typography.Text>
                <Typography.Text type="secondary">实际记录</Typography.Text>
              </div>
            </div>
            <div className="attendance-time-slot">
              <Typography.Text>上午打卡</Typography.Text>
              <Typography.Title level={4}>
                {formatClockTime(today?.clockInTime)}
              </Typography.Title>
            </div>
            <div className="attendance-time-slot">
              <Typography.Text>下午打卡</Typography.Text>
              <Typography.Title level={4}>
                {formatClockTime(today?.clockOutTime)}
              </Typography.Title>
            </div>
          </div>
        </div>

        {canClock && (
          <div className="attendance-clock-actions">
            <Button
              type="primary"
              size="large"
              icon={<EnvironmentOutlined />}
              disabled={!clockActionAvailable || !clockConfig}
              loading={Boolean(submitting)}
              onClick={openClockModal}
            >
              {clockButtonLabel}
            </Button>
            
          </div>
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
          dataSource={visibleRecords}
          loading={loading || applicationsLoading}
          pagination={{ pageSize: 10, showTotal: (total) => `共 ${total} 条记录` }}
          scroll={{ x: 940 }}
        />
      </Card>

      <Modal
        title={`定位${clockActionLabel}`}
        open={clockModalOpen}
        onCancel={closeClockModal}
        width={560}
        destroyOnHidden
        footer={[
          <Button
            key="relocate"
            icon={<ReloadOutlined />}
            disabled={locationState.status === 'locating' || Boolean(submitting)}
            onClick={locateForClock}
          >
            重新定位
          </Button>,
          <Button
            key="submit"
            type="primary"
            icon={<EnvironmentOutlined />}
            disabled={locationState.status !== 'inside' || !locationState.point}
            loading={Boolean(submitting)}
            onClick={() => void handleClockSubmit()}
          >
            确认{clockActionLabel}
          </Button>,
        ]}
      >
        <div className={`attendance-location-state is-${locationState.status}`}>
          <div className="attendance-location-icon">
            <EnvironmentOutlined />
          </div>
          <Typography.Title level={4}>
            {LOCATION_TITLES[locationState.status]}
          </Typography.Title>
          <Typography.Paragraph>{locationDescription}</Typography.Paragraph>
        </div>

        <div className="attendance-location-metrics">
          <div>
            <Typography.Text type="secondary">允许范围</Typography.Text>
            <strong>{clockConfig ? `${clockConfig.radiusMeters} m` : '—'}</strong>
          </div>
          <div>
            <Typography.Text type="secondary">定位精度</Typography.Text>
            <strong>
              {locationState.accuracyMeters === null
                ? '—'
                : `±${Math.round(locationState.accuracyMeters)} m`}
            </strong>
          </div>
          <div>
            <Typography.Text type="secondary">当前距离</Typography.Text>
            <strong>
              {locationState.distanceMeters === null
                ? '—'
                : `${Math.round(locationState.distanceMeters)} m`}
            </strong>
          </div>
        </div>

        
      </Modal>

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
                label: '上午打卡',
                children: formatTime(makeupTarget?.clockInTime ?? null),
              },
              {
                key: 'clockOut',
                label: '下午打卡',
                children: formatTime(makeupTarget?.clockOutTime ?? null),
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
