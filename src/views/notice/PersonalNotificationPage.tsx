import { memo, useMemo, useState } from 'react'
import {
  AuditOutlined,
  BellOutlined,
  CheckCircleOutlined,
  CheckOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  LinkOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import {
  Alert,
  App,
  Badge,
  Button,
  Card,
  Col,
  List,
  Pagination,
  Row,
  Segmented,
  Space,
  Statistic,
  Tag,
  Typography,
} from 'antd'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../../components/common/PageHeader.tsx'
import { usePersonalNotifications } from '../../hooks/notice/usePersonalNotifications.ts'
import { usePersonalNotificationSummary } from '../../hooks/notice/usePersonalNotificationSummary.ts'
import type {
  PersonalNotification,
  PersonalNotificationType,
} from '../../services/notice/notice.types.ts'
import { formatDateTime } from '../../utils/date.ts'
import { getErrorMessage } from '../../utils/error.ts'
import './PersonalNotificationPage.less'

type ReadFilter = 'all' | 'unread' | 'read'

function getNotificationMeta(type: PersonalNotificationType) {
  switch (type) {
    case 'APPROVAL_TASK':
      return { label: '审批待办', color: 'processing', icon: <AuditOutlined /> }
    case 'APPLICATION_APPROVED':
      return { label: '审批通过', color: 'success', icon: <CheckCircleOutlined /> }
    case 'APPLICATION_REJECTED':
      return { label: '审批驳回', color: 'error', icon: <CloseCircleOutlined /> }
    case 'ATTENDANCE_ABNORMAL':
      return { label: '考勤异常', color: 'warning', icon: <ClockCircleOutlined /> }
  }
}

function getNotificationTarget(notification: PersonalNotification): string {
  const businessId = notification.relatedBusinessId
  if (notification.relatedBusinessType === 'ATTENDANCE_RECORD') {
    return `/attendance?recordId=${businessId}`
  }
  if (notification.notificationType === 'APPROVAL_TASK') {
    return `/flow/approvals?applicationId=${businessId}`
  }
  return `/flow/applications?applicationId=${businessId}`
}

export const PersonalNotificationPage = memo(function PersonalNotificationPage() {
  const [filter, setFilter] = useState<ReadFilter>('all')
  const [markingAll, setMarkingAll] = useState(false)
  const { message } = App.useApp()
  const navigate = useNavigate()
  const { unreadCount } = usePersonalNotificationSummary()
  const {
    pageData,
    loading,
    error,
    loadPage,
    markRead,
    markAllRead,
  } = usePersonalNotifications()

  const visibleNotifications = useMemo(
    () => pageData.items.filter((notification) => {
      if (filter === 'unread') return !notification.read
      if (filter === 'read') return notification.read
      return true
    }),
    [filter, pageData.items],
  )

  const handleOpen = async (notification: PersonalNotification) => {
    if (!notification.read) {
      try {
        await markRead(notification.id)
      } catch (requestError) {
        message.error(getErrorMessage(requestError, '通知已读状态更新失败'))
      }
    }
    navigate(getNotificationTarget(notification))
  }

  const handleMarkAllRead = async () => {
    setMarkingAll(true)
    try {
      await markAllRead()
      message.success('个人通知已全部标记为已读')
    } catch (requestError) {
      message.error(getErrorMessage(requestError, '全部已读操作失败'))
    } finally {
      setMarkingAll(false)
    }
  }

  const readCount = Math.max(0, pageData.total - unreadCount)

  return (
    <section className="personal-notification-page">
      <PageHeader
        title="个人通知"
        description=""
        extra={
          <Button
            icon={<CheckOutlined />}
            disabled={unreadCount === 0}
            loading={markingAll}
            onClick={() => void handleMarkAllRead()}
          >
            全部已读
          </Button>
        }
      />

      <Row gutter={[14, 14]} className="personal-notification-stats">
        <Col xs={24} sm={8}>
          <Card bordered={false}>
            <Statistic title="通知总数" value={pageData.total} suffix="条" prefix={<BellOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false}>
            <Statistic title="未读通知" value={unreadCount} suffix="条" prefix={<Badge status="processing" />} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false}>
            <Statistic title="已读通知" value={readCount} suffix="条" prefix={<CheckCircleOutlined />} />
          </Card>
        </Col>
      </Row>

      {Boolean(error) && (
        <Alert
          className="personal-notification-alert"
          type="warning"
          showIcon
          message="个人通知暂时无法加载"
          description={getErrorMessage(error, '请稍后重试')}
          action={
            <Button
              size="small"
              icon={<ReloadOutlined />}
              onClick={() => void loadPage(pageData.page)}
            >
              重新加载
            </Button>
          }
        />
      )}

      <Card bordered={false} className="personal-notification-list-card">
        <div className="personal-notification-toolbar">
          <Segmented<ReadFilter>
            value={filter}
            onChange={setFilter}
            options={[
              { label: '全部通知', value: 'all' },
              { label: `未读 ${unreadCount}`, value: 'unread' },
              { label: '已读', value: 'read' },
            ]}
          />
          <Button
            type="text"
            icon={<ReloadOutlined />}
            loading={loading}
            onClick={() => void loadPage(pageData.page)}
          >
            刷新
          </Button>
        </div>

        <List
          loading={loading}
          dataSource={visibleNotifications}
          locale={{ emptyText: '暂无符合条件的个人通知' }}
          renderItem={(notification) => {
            const meta = getNotificationMeta(notification.notificationType)
            return (
              <List.Item
                className={
                  notification.read
                    ? 'personal-notification-item is-read'
                    : 'personal-notification-item'
                }
              >
                <button
                  type="button"
                  className="personal-notification-button"
                  onClick={() => void handleOpen(notification)}
                >
                  <span className={`personal-notification-icon is-${notification.notificationType.toLowerCase()}`}>
                    {meta.icon}
                  </span>
                  <span className="personal-notification-content">
                    <Space size={8} wrap>
                      <Typography.Title level={4}>{notification.title}</Typography.Title>
                      <Tag color={meta.color} bordered={false}>{meta.label}</Tag>
                      {!notification.read && <Badge status="processing" text="未读" />}
                    </Space>
                    <Typography.Paragraph ellipsis={{ rows: 2 }}>
                      {notification.content}
                    </Typography.Paragraph>
                    <Typography.Text type="secondary">
                      {formatDateTime(notification.createdAt)} · 业务记录 #{notification.relatedBusinessId}
                    </Typography.Text>
                  </span>
                  <span className="personal-notification-link">
                    <LinkOutlined /> 前往处理
                  </span>
                </button>
              </List.Item>
            )
          }}
        />

        {pageData.total > pageData.pageSize && (
          <Pagination
            className="personal-notification-pagination"
            current={pageData.page}
            pageSize={pageData.pageSize}
            total={pageData.total}
            showSizeChanger={false}
            showTotal={(total) => `共 ${total} 条通知`}
            onChange={(page) => void loadPage(page)}
          />
        )}
      </Card>
    </section>
  )
})
