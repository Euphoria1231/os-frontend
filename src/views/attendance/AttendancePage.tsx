import { memo, useEffect, useState } from 'react'
import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
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
  Row,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
  type TableProps,
} from 'antd'
import dayjs, { type Dayjs } from 'dayjs'
import { AttendanceStatusTag } from '../../components/attendance/AttendanceStatusTag.tsx'
import { PageHeader } from '../../components/common/PageHeader.tsx'
import { useAttendance } from '../../hooks/attendance/useAttendance.ts'
import { useAuth } from '../../hooks/auth/useAuth.ts'
import type { AttendanceRecord } from '../../services/attendance/attendance.types.ts'
import { formatDateTime } from '../../utils/date.ts'
import { getErrorMessage } from '../../utils/error.ts'
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

export const AttendancePage = memo(function AttendancePage() {
  const [now, setNow] = useState(() => new Date())
  const [range, setRange] = useState<[Dayjs, Dayjs]>(() => [
    dayjs().startOf('month'),
    dayjs().endOf('month'),
  ])
  const [submitting, setSubmitting] = useState<'in' | 'out' | null>(null)
  const { message } = App.useApp()
  const { user, hasAuthority } = useAuth()
  const { today, records, loading, error, reload, clockIn, clockOut } = useAttendance(
    range[0].format('YYYY-MM-DD'),
    range[1].format('YYYY-MM-DD'),
  )
  const canClock = hasAuthority('POST:/api/attendance/**')

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

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
  ]

  const lateCount = records.filter((record) => record.attendanceStatus === 'LATE').length
  const completedCount = records.filter((record) => record.clockInTime && record.clockOutTime).length
  const dateLabel = new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(now)

  return (
    <section className="attendance-page">
      <PageHeader
        eyebrow="ATTENDANCE / PERSONAL"
        title="考勤打卡"
        description="完成每日上下班打卡并查询个人记录，迟到状态由后端动态业务参数统一判定。"
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
        <Col xs={24} sm={8}>
          <Card bordered={false}>
            <Statistic title="区间出勤" value={records.length} suffix="天" prefix={<CalendarOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false}>
            <Statistic title="完整打卡" value={completedCount} suffix="天" prefix={<CheckCircleOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false}>
            <Statistic title="迟到记录" value={lateCount} suffix="次" prefix={<ClockCircleOutlined />} />
          </Card>
        </Col>
      </Row>

      {error && (
        <Alert
          className="attendance-alert"
          type="warning"
          showIcon
          message="考勤数据暂时无法加载"
          description={getErrorMessage(error, '请稍后重试')}
          action={<Button size="small" icon={<ReloadOutlined />} onClick={() => void reload()}>重新加载</Button>}
        />
      )}

      <Card bordered={false} className="attendance-record-card">
        <div className="attendance-record-toolbar">
          <div>
            <Typography.Title level={4}>个人打卡记录</Typography.Title>
            <Typography.Text type="secondary">按日期区间查询本人的考勤明细</Typography.Text>
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
            <Button type="text" icon={<ReloadOutlined />} loading={loading} onClick={() => void reload()}>
              刷新
            </Button>
          </Space>
        </div>
        <Table<AttendanceRecord>
          rowKey="id"
          columns={columns}
          dataSource={records}
          loading={loading}
          pagination={{ pageSize: 10, showTotal: (total) => `共 ${total} 条记录` }}
          scroll={{ x: 820 }}
        />
      </Card>
    </section>
  )
})
