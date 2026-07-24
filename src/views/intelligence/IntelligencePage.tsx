import {
  AuditOutlined,
  ClockCircleOutlined,
  MessageOutlined,
} from '@ant-design/icons'
import { Tabs, type TabsProps } from 'antd'
import { ApprovalAssistantPanel } from './ApprovalAssistantPanel.tsx'
import { AttendanceAnalysisPanel } from './AttendanceAnalysisPanel.tsx'
import { OfficeQuestionPanel } from './OfficeQuestionPanel.tsx'
import './IntelligencePage.less'

const TAB_ITEMS: TabsProps['items'] = [
  {
    key: 'approval',
    label: (
      <span className="intelligence-tab-label">
        <AuditOutlined />
        <span>
          <strong>智能审批</strong>
        </span>
      </span>
    ),
    children: <ApprovalAssistantPanel />,
  },
  {
    key: 'attendance',
    label: (
      <span className="intelligence-tab-label">
        <ClockCircleOutlined />
        <span>
          <strong>考勤分析</strong>
        </span>
      </span>
    ),
    children: <AttendanceAnalysisPanel />,
  },
  {
    key: 'question',
    label: (
      <span className="intelligence-tab-label">
        <MessageOutlined />
        <span>
          <strong>办公问答</strong>
        </span>
      </span>
    ),
    children: <OfficeQuestionPanel />,
  },
]

export function IntelligencePage() {
  return (
    <section className="intelligence-page">
      <div className="intelligence-tabs-shell">
        <Tabs defaultActiveKey="approval" items={TAB_ITEMS} size="large" />
      </div>
    </section>
  )
}
