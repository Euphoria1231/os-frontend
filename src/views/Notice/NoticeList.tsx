import { List, Typography, Tag, Card, Select, Space, Button, Modal, Spin, Empty, Badge } from 'antd';
import { NotificationOutlined, PushpinOutlined, ReloadOutlined, PaperClipOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useNoticeList, useNoticeDetail } from '../../hooks/useNotice';
import type { Notice } from '../../types/notice';

const { Title, Text, Paragraph } = Typography;

const CATEGORIES = [
  { label: '全部分类', value: 'all' },
  { label: '行政通知', value: '行政通知' },
  { label: '部门通知', value: '部门通知' },
  { label: '系统公告', value: '系统公告' },
  { label: '培训通知', value: '培训通知' },
];

export default function NoticeListPage() {
  const { notices, total, loading, pageNum, pageSize, category, setCategory, setPageNum, setPageSize, fetchNotices } =
    useNoticeList();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { detail, loading: detailLoading } = useNoticeDetail(selectedId);

  const handleCategoryChange = (value: string) => {
    setCategory(value === 'all' ? undefined : value);
    setPageNum(1);
  };

  return (
    <div>
      <Title level={3}>公告列表</Title>

      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Select
            value={category || 'all'}
            options={CATEGORIES}
            onChange={handleCategoryChange}
            style={{ width: 150 }}
          />
          <Button icon={<ReloadOutlined />} onClick={fetchNotices}>
            刷新
          </Button>
        </Space>

        <List<Notice>
          loading={loading}
          dataSource={notices}
          locale={{ emptyText: <Empty description="暂无公告" /> }}
          pagination={{
            current: pageNum,
            pageSize,
            total,
            showSizeChanger: true,
            showTotal: (t) => `共 ${t} 条`,
            onChange: (page, size) => {
              setPageNum(page);
              setPageSize(size || 10);
            },
          }}
          renderItem={(notice) => (
            <List.Item
              key={notice.id}
              onClick={() => setSelectedId(notice.id)}
              style={{ cursor: 'pointer', padding: '12px 0' }}
            >
              <List.Item.Meta
                avatar={
                  <Badge dot={!notice.isRead} offset={[6, 0]}>
                    <NotificationOutlined style={{ fontSize: 20, color: notice.pinned ? '#faad14' : '#1677ff' }} />
                  </Badge>
                }
                title={
                  <Space>
                    {notice.pinned && <PushpinOutlined style={{ color: '#faad14' }} />}
                    <Text strong={!notice.isRead}>{notice.title}</Text>
                    <Tag>{notice.category}</Tag>
                  </Space>
                }
                description={
                  <Space direction="vertical" size={2}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {notice.publisher} · {notice.publishTime}
                    </Text>
                    <Text type="secondary" ellipsis style={{ maxWidth: 600 }}>
                      {notice.summary}
                    </Text>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      </Card>

      <Modal
        title={detail?.title || '公告详情'}
        open={selectedId !== null}
        onCancel={() => setSelectedId(null)}
        footer={<Button onClick={() => setSelectedId(null)}>关闭</Button>}
        width={700}
      >
        {detailLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin description="加载中..." />
          </div>
        ) : detail ? (
          <div>
            <Space style={{ marginBottom: 16 }}>
              <Tag>{detail.category}</Tag>
              <Text type="secondary">{detail.publisher}</Text>
              <Text type="secondary">{detail.publishTime}</Text>
              <Text type="secondary">阅读 {detail.readCount}</Text>
            </Space>
            <Paragraph style={{ whiteSpace: 'pre-wrap' }}>{detail.content}</Paragraph>
            {detail.attachments.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <Text strong>附件：</Text>
                {detail.attachments.map((att, i) => (
                  <div key={i}>
                    <PaperClipOutlined /> <a href={att.url}>{att.name}</a>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <Empty description="公告不存在" />
        )}
      </Modal>
    </div>
  );
}
