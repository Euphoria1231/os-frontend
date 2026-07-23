import { memo, useEffect, useMemo, useState } from 'react'
import {
  BellOutlined,
  EyeOutlined,
  FileTextOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import {
  Alert,
  App,
  Badge,
  Button,
  Card,
  Col,
  Drawer,
  Form,
  Input,
  List,
  Modal,
  Row,
  Segmented,
  Space,
  Statistic,
  Tag,
  Typography,
} from 'antd'
import { useSearchParams } from 'react-router-dom'
import { PageHeader } from '../../components/common/PageHeader.tsx'
import { useAuth } from '../../hooks/auth/useAuth.ts'
import { useNotices } from '../../hooks/notice/useNotices.ts'
import type { Notice, NoticePublishRequest } from '../../services/notice/notice.types.ts'
import { formatDateTime } from '../../utils/date.ts'
import { getErrorMessage } from '../../utils/error.ts'
import './NoticePage.less'

type ReadFilter = 'all' | 'unread' | 'read'

export const NoticePage = memo(function NoticePage() {
  const [form] = Form.useForm<NoticePublishRequest>()
  const [searchParams, setSearchParams] = useSearchParams()
  const [filter, setFilter] = useState<ReadFilter>('all')
  const [keyword, setKeyword] = useState('')
  const [publishModalOpen, setPublishModalOpen] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const { message } = App.useApp()
  const { hasAuthority } = useAuth()
  const { notices, unreadCount, loading, error, reload, publishNotice, readNotice } = useNotices()
  const canPublish = hasAuthority('POST:/api/notices')
  const canMarkRead = hasAuthority('PUT:/api/notices/*/read')
  const noticeIdParam = searchParams.get('noticeId')
  const parsedNoticeId = Number(noticeIdParam)
  const focusedNoticeId = noticeIdParam !== null
    && Number.isSafeInteger(parsedNoticeId)
    && parsedNoticeId > 0
    ? parsedNoticeId
    : null

  useEffect(() => {
    if (!focusedNoticeId) {
      return
    }

    let active = true
    setDrawerOpen(true)
    setDetailLoading(true)
    readNotice(focusedNoticeId, canMarkRead)
      .then((notice) => {
        if (active) {
          setSelectedNotice(notice)
        }
      })
      .catch((requestError: unknown) => {
        if (active) {
          setSelectedNotice(null)
          message.error(getErrorMessage(requestError, '公告详情加载失败'))
        }
      })
      .finally(() => {
        if (active) {
          setDetailLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [canMarkRead, focusedNoticeId, message, readNotice])

  const filteredNotices = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase()
    return notices.filter((notice) => {
      const matchesRead =
        filter === 'all' || (filter === 'read' ? notice.read : !notice.read)
      const matchesKeyword =
        !normalizedKeyword ||
        notice.title.toLowerCase().includes(normalizedKeyword) ||
        notice.content.toLowerCase().includes(normalizedKeyword)
      return matchesRead && matchesKeyword
    })
  }, [filter, keyword, notices])

  const openPublishModal = () => {
    form.setFieldsValue({ title: '', content: '' })
    setPublishModalOpen(true)
  }

  const closePublishModal = () => {
    setPublishModalOpen(false)
    form.resetFields()
  }

  const handlePublish = async (values: NoticePublishRequest) => {
    setPublishing(true)
    try {
      await publishNotice({ title: values.title.trim(), content: values.content.trim() })
      message.success('公司公告已发布')
      closePublishModal()
    } catch (requestError) {
      message.error(getErrorMessage(requestError, '公告发布失败'))
    } finally {
      setPublishing(false)
    }
  }

  const handleOpenNotice = (notice: Notice) => {
    setSelectedNotice(notice)
    const nextSearchParams = new URLSearchParams(searchParams)
    nextSearchParams.set('noticeId', String(notice.id))
    setSearchParams(nextSearchParams)
  }

  const closeNotice = () => {
    setDrawerOpen(false)
    setSelectedNotice(null)
    const nextSearchParams = new URLSearchParams(searchParams)
    nextSearchParams.delete('noticeId')
    setSearchParams(nextSearchParams, { replace: true })
  }

  const readCount = Math.max(0, notices.length - unreadCount)

  return (
    <section className="notice-page">
      <PageHeader
        title="公告通知"
        description=""
        extra={
          canPublish ? (
            <Button type="primary" icon={<PlusOutlined />} onClick={openPublishModal}>
              发布公告
            </Button>
          ) : null
        }
      />

      <Row gutter={[14, 14]} className="notice-stats">
        <Col xs={24} sm={8}>
          <Card bordered={false}><Statistic title="公告总数" value={notices.length} suffix="篇" prefix={<FileTextOutlined />} /></Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false}><Statistic title="未读公告" value={unreadCount} suffix="篇" prefix={<BellOutlined />} /></Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false}><Statistic title="已读公告" value={readCount} suffix="篇" prefix={<EyeOutlined />} /></Card>
        </Col>
      </Row>

      {Boolean(error) && (
        <Alert
          className="notice-alert"
          type="warning"
          showIcon
          message="公告数据暂时无法加载"
          description={getErrorMessage(error, '请稍后重试')}
          action={<Button size="small" icon={<ReloadOutlined />} onClick={() => void reload()}>重新加载</Button>}
        />
      )}

      <Card bordered={false} className="notice-list-card">
        <div className="notice-toolbar">
          <Segmented<ReadFilter>
            value={filter}
            onChange={setFilter}
            options={[
              { label: '全部公告', value: 'all' },
              { label: `未读 ${unreadCount}`, value: 'unread' },
              { label: '已读', value: 'read' },
            ]}
          />
          <Space>
            <Input
              allowClear
              prefix={<SearchOutlined />}
              placeholder="搜索公告标题或内容"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
            />
            <Button type="text" icon={<ReloadOutlined />} loading={loading} onClick={() => void reload()}>
              刷新
            </Button>
          </Space>
        </div>

        <List
          loading={loading}
          dataSource={filteredNotices}
          pagination={{ pageSize: 8, showSizeChanger: false }}
          locale={{ emptyText: '暂无符合条件的公告' }}
          renderItem={(notice) => (
            <List.Item className={notice.read ? 'notice-item is-read' : 'notice-item'}>
              <button type="button" className="notice-item-button" onClick={() => handleOpenNotice(notice)}>
                <span className="notice-item-mark"><BellOutlined /></span>
                <div className="notice-item-content">
                  <Space size={8}>
                    <Typography.Title level={4}>{notice.title}</Typography.Title>
                    {!notice.read && <Badge status="processing" text="未读" />}
                  </Space>
                  <Typography.Paragraph ellipsis={{ rows: 2 }}>{notice.content}</Typography.Paragraph>
                  <Space size={12} className="notice-item-meta">
                    <Typography.Text>发布人 · 员工 {notice.publisherId}</Typography.Text>
                    <Typography.Text>{formatDateTime(notice.publishedAt)}</Typography.Text>
                  </Space>
                </div>
                <span className="notice-view-action"><EyeOutlined /> 查看</span>
              </button>
            </List.Item>
          )}
        />
      </Card>

      <Modal title="发布公司公告" open={publishModalOpen} onCancel={closePublishModal} footer={null} width={720}>
        <Form<NoticePublishRequest> form={form} layout="vertical" onFinish={handlePublish} requiredMark="optional">
          <Form.Item
            label="公告标题"
            name="title"
            rules={[
              { required: true, whitespace: true, message: '请输入公告标题' },
              { max: 200, message: '公告标题不能超过 200 个字符' },
            ]}
          >
            <Input placeholder="概括公告核心内容" maxLength={200} showCount />
          </Form.Item>
          <Form.Item
            label="公告正文"
            name="content"
            rules={[
              { required: true, whitespace: true, message: '请输入公告正文' },
              { max: 10000, message: '公告内容不能超过 10000 个字符' },
            ]}
          >
            <Input.TextArea rows={12} maxLength={10000} showCount placeholder="请输入公告正文，支持自然换行" />
          </Form.Item>
          <div className="notice-form-actions">
            <Button onClick={closePublishModal}>取消</Button>
            <Button type="primary" htmlType="submit" loading={publishing}>确认发布</Button>
          </div>
        </Form>
      </Modal>

      <Drawer
        title="公告详情"
        open={drawerOpen}
        onClose={closeNotice}
        width={640}
        loading={detailLoading}
      >
        {selectedNotice && (
          <article className="notice-detail">
            <Tag bordered={false}>{selectedNotice.read ? '已读公告' : '未读公告'}</Tag>
            <Typography.Title level={2}>{selectedNotice.title}</Typography.Title>
            <Space size={14} className="notice-detail-meta">
              <Typography.Text>发布人 · 员工 {selectedNotice.publisherId}</Typography.Text>
              <Typography.Text>{formatDateTime(selectedNotice.publishedAt)}</Typography.Text>
            </Space>
            <div className="notice-detail-divider" />
            <Typography.Paragraph className="notice-detail-content">
              {selectedNotice.content}
            </Typography.Paragraph>
            {selectedNotice.readAt && (
              <Typography.Text type="secondary">阅读于 {formatDateTime(selectedNotice.readAt)}</Typography.Text>
            )}
          </article>
        )}
      </Drawer>
    </section>
  )
})
