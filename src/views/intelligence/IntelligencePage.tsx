import {
  AuditOutlined,
  ClockCircleOutlined,
  MessageOutlined,
  RobotOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons'
import { Tabs, Tag, Typography, type TabsProps } from 'antd'
import { ApprovalAssistantPanel } from './ApprovalAssistantPanel.tsx'
import { AttendanceAnalysisPanel } from './AttendanceAnalysisPanel.tsx'
import { OfficeQuestionPanel } from './OfficeQuestionPanel.tsx'
import './IntelligencePage.less'

const TAB_ITEMS: TabsProps['items'] = [
  {
    key: 'approval',
    label: <span><AuditOutlined /> 智能审批</span>,
    children: <ApprovalAssistantPanel />,
  },
  {
    key: 'attendance',
    label: <span><ClockCircleOutlined /> 考勤分析</span>,
    children: <AttendanceAnalysisPanel />,
  },
  {
    key: 'question',
    label: <span><MessageOutlined /> 办公问答</span>,
    children: <OfficeQuestionPanel />,
  },
]

export function IntelligencePage() {
  return (
    <section className="intelligence-page">
      <header className="intelligence-hero">
        <div className="intelligence-hero-copy">
          <Tag bordered={false} icon={<RobotOutlined />}>OA INTELLIGENCE</Tag>
          <Typography.Title>智能办公中枢</Typography.Title>
          <Typography.Paragraph>
            将审批判断、考勤洞察和制度问答集中在一个安全、可追溯的工作台。
          </Typography.Paragraph>
        </div>

        <div className="intelligence-hero-metrics" aria-label="智能办公能力说明">
          <div>
            <strong>03</strong>
            <span>业务场景</span>
          </div>
          <div>
            <SafetyCertificateOutlined />
            <span>Gateway 鉴权</span>
          </div>
          <div>
            <AuditOutlined />
            <span>结果可审计</span>
          </div>
        </div>
      </header>

      <div className="intelligence-tabs-shell">
        <Tabs defaultActiveKey="approval" items={TAB_ITEMS} size="large" />
      </div>
    </section>
  )
}
