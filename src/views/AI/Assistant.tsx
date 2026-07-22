import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Typography,
  Input,
  Button,
  Card,
  Space,
  Tag,
  Alert,
  Spin,
  Empty,
  Avatar,
  Statistic,
  Row,
  Col,
  Divider,
} from 'antd';
import {
  SendOutlined,
  RobotOutlined,
  UserOutlined,
  BulbOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { useAIAsk, useAttendanceAnalysis } from '../../hooks/useIntelligence';
import type { AIAskResponse } from '../../types/intelligence';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
  response?: AIAskResponse;
}

const QUICK_QUESTIONS = [
  '帮我分析一下本周的考勤情况',
  '我有哪些待办审批？',
  '本月考勤趋势如何？',
];

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  success: { label: '正常', color: 'success' },
  degraded: { label: '降级', color: 'warning' },
  failed: { label: '失败', color: 'error' },
};

const RISK_COLORS: Record<string, string> = {
  low: 'green',
  medium: 'orange',
  high: 'red',
};

export default function AssistantPage() {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const { loading, ask } = useAIAsk();
  const { analysis, loading: analysisLoading, fetchAnalysis } = useAttendanceAnalysis();
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchAnalysis();
  }, [fetchAnalysis]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = useCallback(async () => {
    const q = question.trim();
    if (!q || loading) return;

    setMessages((prev) => [...prev, { role: 'user', content: q }]);
    setQuestion('');

    const response = await ask(q);
    if (response) {
      setMessages((prev) => [
        ...prev,
        { role: 'ai', content: response.answer, response },
      ]);
    } else {
      setMessages((prev) => [
        ...prev,
        { role: 'ai', content: '抱歉，无法获取回答，请稍后重试。' },
      ]);
    }
  }, [question, loading, ask]);

  const handleQuickQuestion = useCallback(
    (q: string) => {
      setQuestion(q);
    },
    [],
  );

  return (
    <div>
      <Title level={3}>智能办公助手</Title>

      {/* 考勤智能分析卡片 */}
      <Card
        title="考勤智能分析"
        size="small"
        style={{ marginBottom: 16 }}
        extra={
          analysis && (
            <Tag color={STATUS_CONFIG[analysis.status]?.color}>
              {STATUS_CONFIG[analysis.status]?.label}
            </Tag>
          )
        }
      >
        {analysisLoading ? (
          <div style={{ textAlign: 'center', padding: 20 }}>
            <Spin description="分析中..." />
          </div>
        ) : analysis ? (
          <>
            <Paragraph type="secondary">{analysis.summary}</Paragraph>
            <Row gutter={[16, 8]}>
              <Col span={6}>
                <Statistic title="出勤率" value={analysis.metrics.attendanceRate} suffix="%" />
              </Col>
              <Col span={6}>
                <Statistic
                  title="迟到"
                  value={analysis.metrics.lateCount}
                  valueStyle={{ color: '#faad14' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="早退"
                  value={analysis.metrics.earlyLeaveCount}
                  valueStyle={{ color: '#faad14' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="缺勤"
                  value={analysis.metrics.absentCount}
                  valueStyle={{ color: '#ff4d4f' }}
                />
              </Col>
            </Row>
            {analysis.risks.length > 0 && (
              <div style={{ marginTop: 12 }}>
                {analysis.risks.map((risk, idx) => (
                  <Alert
                    key={idx}
                    type={risk.level === 'high' ? 'error' : risk.level === 'medium' ? 'warning' : 'info'}
                    message={risk.desc}
                    showIcon
                    style={{ marginBottom: 4 }}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <Empty description="暂无分析数据" />
        )}
      </Card>

      {/* 对话区域 */}
      <Card style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 420px)', minHeight: 300 }}>
        <div
          ref={listRef}
          style={{ flex: 1, overflow: 'auto', padding: '0 4px' }}
        >
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <RobotOutlined style={{ fontSize: 48, color: '#999' }} />
              <Paragraph type="secondary" style={{ marginTop: 16 }}>
                你好！我是智能办公助手，可以帮你查询考勤、审批等信息。
              </Paragraph>
              <Space wrap>
                {QUICK_QUESTIONS.map((q) => (
                  <Button
                    key={q}
                    size="small"
                    onClick={() => handleQuickQuestion(q)}
                  >
                    {q}
                  </Button>
                ))}
              </Space>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  gap: 8,
                  marginBottom: 16,
                  flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                }}
              >
                <Avatar
                  icon={msg.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
                  style={{
                    backgroundColor: msg.role === 'user' ? '#1677ff' : '#52c41a',
                    flexShrink: 0,
                  }}
                />
                <div
                  style={{
                    maxWidth: '75%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    backgroundColor: msg.role === 'user' ? '#e6f4ff' : '#f6ffed',
                  }}
                >
                  <Paragraph style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                    {msg.content}
                  </Paragraph>
                  {msg.response && (
                    <>
                      {msg.response.status === 'degraded' && (
                        <Tag color="warning" style={{ marginTop: 4 }}>
                          降级模式
                        </Tag>
                      )}
                      {msg.response.suggestions.length > 0 && (
                        <div style={{ marginTop: 8 }}>
                          <Text type="secondary">
                            <BulbOutlined /> 建议：
                          </Text>
                          <div style={{ marginTop: 4 }}>
                            {msg.response.suggestions.map((s, i) => (
                              <Tag key={i} color="blue" style={{ marginBottom: 4 }}>
                                {s}
                              </Tag>
                            ))}
                          </div>
                        </div>
                      )}
                      {msg.response.risks.length > 0 && (
                        <div style={{ marginTop: 8 }}>
                          {msg.response.risks.map((r, i) => (
                            <Alert
                              key={i}
                              type="warning"
                              message={r}
                              showIcon
                              icon={<WarningOutlined />}
                              style={{ marginBottom: 4, padding: '4px 8px' }}
                            />
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))
          )}
          {loading && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <Avatar icon={<RobotOutlined />} style={{ backgroundColor: '#52c41a', flexShrink: 0 }} />
              <div style={{ padding: '8px 12px', borderRadius: 8, backgroundColor: '#f6ffed' }}>
                <Spin size="small" />
              </div>
            </div>
          )}
        </div>

        <Divider style={{ margin: '8px 0' }} />

        <Space.Compact style={{ width: '100%' }}>
          <TextArea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="输入你的问题..."
            autoSize={{ minRows: 1, maxRows: 3 }}
            onPressEnter={(e) => {
              if (!e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            disabled={loading}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSubmit}
            loading={loading}
            disabled={!question.trim()}
          >
            发送
          </Button>
        </Space.Compact>
      </Card>
    </div>
  );
}
