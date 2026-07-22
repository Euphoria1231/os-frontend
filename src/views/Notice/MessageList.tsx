import { List, Typography, Tag, Card, Button, Space, Empty, App, Badge } from 'antd';
import {
  MailOutlined,
  ReloadOutlined,
  CheckOutlined,
  BellOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useMessages } from '../../hooks/useNotice';
import type { Message, MessageType } from '../../types/notice';

const { Title, Text } = Typography;

const TYPE_CONFIG: Record<MessageType, { label: string; color: string; icon: React.ReactNode }> = {
  approval: { label: '审批', color: 'blue', icon: <FileTextOutlined /> },
  task: { label: '任务', color: 'orange', icon: <ClockCircleOutlined /> },
  system: { label: '系统', color: 'default', icon: <BellOutlined /> },
  attendance: { label: '考勤', color: 'red', icon: <WarningOutlined /> },
};

export default function MessageListPage() {
  const navigate = useNavigate();
  const { messages, total, loading, pageNum, pageSize, setPageNum, setPageSize, fetchMessages, markRead, markAllRead } =
    useMessages();
  const { message } = App.useApp();

  const unreadCount = messages.filter((m) => !m.isRead).length;

  const handleMarkRead = async (id: number) => {
    const success = await markRead(id);
    if (success) {
      message.success('已标记为已读');
    }
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;
    const success = await markAllRead();
    if (success) {
      message.success(`已将 ${unreadCount} 条消息标记为已读`);
    }
  };

  const handleClickMessage = (msg: Message) => {
    if (!msg.isRead) {
      handleMarkRead(msg.id);
    }
    if (msg.link) {
      navigate(msg.link);
    }
  };

  return (
    <div>
      <Title level={3}>
        <Space>
          站内消息
          {unreadCount > 0 && <Badge count={unreadCount} />}
        </Space>
      </Title>

      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Button
            icon={<CheckOutlined />}
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
          >
            全部已读
          </Button>
          <Button icon={<ReloadOutlined />} onClick={fetchMessages}>
            刷新
          </Button>
        </Space>

        <List<Message>
          loading={loading}
          dataSource={messages}
          locale={{ emptyText: <Empty description="暂无消息" /> }}
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
          renderItem={(msg) => {
            const config = TYPE_CONFIG[msg.type];
            return (
              <List.Item
                key={msg.id}
                actions={
                  !msg.isRead
                    ? [
                        <Button
                          key="read"
                          type="link"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkRead(msg.id);
                          }}
                        >
                          标为已读
                        </Button>,
                      ]
                    : undefined
                }
                onClick={() => handleClickMessage(msg)}
                style={{ cursor: 'pointer', padding: '12px 0' }}
              >
                <List.Item.Meta
                  avatar={
                    <Badge dot={!msg.isRead} offset={[6, 0]}>
                      <MailOutlined style={{ fontSize: 20, color: msg.isRead ? '#999' : '#1677ff' }} />
                    </Badge>
                  }
                  title={
                    <Space>
                      <Text strong={!msg.isRead}>{msg.title}</Text>
                      <Tag color={config.color}>{config.label}</Tag>
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size={2}>
                      <Text type="secondary">{msg.content}</Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {msg.createdAt}
                      </Text>
                    </Space>
                  }
                />
              </List.Item>
            );
          }}
        />
      </Card>
    </div>
  );
}
