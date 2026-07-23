import { memo } from 'react'
import {
  ArrowRightOutlined,
  BellOutlined,
  ClockCircleOutlined,
  RadarChartOutlined,
  SolutionOutlined,
  TeamOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons'
import {
  Alert,
  Badge,
  Card,
  Col,
  Empty,
  Flex,
  List,
  Row,
  Tag,
  Typography,
} from 'antd'
import { Link } from 'react-router-dom'
import { WorkspaceUtilityRail } from '../../components/layout/WorkspaceUtilityRail.tsx'
import { useAuth } from '../../hooks/auth/useAuth.ts'
import { useWorkspaceUtilityData } from '../../hooks/workspace/useWorkspaceUtilityData.ts'
import { getErrorMessage } from '../../utils/error.ts'
import { WeatherWidget } from './WeatherWidget.tsx'
import './WorkbenchPage.less'

const { Paragraph, Title } = Typography

const moduleCards = [
  {
    title: '组织权限',
    description: '统一维护部门、岗位、员工与角色权限。',
    path: '/employees',
    authority: 'GET:/api/user/**',
    icon: <TeamOutlined />,
    tone: 'navy',
  },
  {
    title: '考勤打卡',
    description: '记录每日上下班时间，快速查看个人考勤。',
    path: '/attendance',
    authority: 'GET:/api/attendance/**',
    icon: <ClockCircleOutlined />,
    tone: 'teal',
  },
  {
    title: '流程审批',
    description: '提交请假、加班申请并跟踪处理进展。',
    path: '/flow/applications',
    authority: 'GET:/api/flow/applications/**',
    icon: <SolutionOutlined />,
    tone: 'amber',
  },
  {
    title: '公告通知',
    description: '及时接收公司公告，保持信息同步。',
    path: '/notices',
    authority: 'GET:/api/notices/**',
    icon: <BellOutlined />,
    tone: 'blue',
  },
]

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 11) return '早上好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  return '晚上好'
}

export const WorkbenchPage = memo(function WorkbenchPage() {
  const { user, hasAuthority } = useAuth()
  const utilityData = useWorkspaceUtilityData()
  const { tasks, taskLoading, taskError } = utilityData

  const visibleCards = moduleCards.filter((item) => hasAuthority(item.authority))
  const dateLabel = new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(new Date())

  return (
    <div className="workbench-page">
      <div className="workbench-dashboard-grid">
        <main className="workbench-main">
          <section className="workbench-hero">
            <div className="workbench-hero-copy">
              <Title level={2}>
                {getGreeting()}，{user?.realName ?? '同事'}
              </Title>
              <Paragraph>{dateLabel}，欢迎回到你的办公工作台。</Paragraph>
            </div>
            <WeatherWidget />
          </section>

          <section className="workbench-section">
            <div className="workbench-section-heading">
              <div>
                <Title level={3}>常用工作入口</Title>
              </div>
            </div>

            <Row gutter={[14, 14]}>
              {visibleCards.map((item) => (
                <Col xs={24} md={12} xl={6} key={item.path}>
                  <Link to={item.path} className="workbench-module-link">
                    <Card bordered={false} className={`workbench-module-card tone-${item.tone}`}>
                      <Flex vertical gap={20}>
                        <Flex justify="space-between" align="center">
                          <span className="workbench-module-icon">{item.icon}</span>
                          <ArrowRightOutlined className="workbench-module-arrow" />
                        </Flex>
                        <div>
                          <Title level={4}>{item.title}</Title>
                          <Paragraph>{item.description}</Paragraph>
                        </div>
                      </Flex>
                    </Card>
                  </Link>
                </Col>
              ))}
            </Row>
          </section>

          <Card bordered={false} className="workbench-panel-card workbench-task-card">
            <div className="workbench-card-heading">
              <div>
                <Flex align="center" gap={10}>
                  <Title level={3}>待办事项</Title>
                  <Badge count={tasks.length} showZero color="#16745f" />
                </Flex>
              </div>
              <Link to="/flow/applications">查看全部</Link>
            </div>

            {Boolean(taskError) && (
              <Alert
                type="warning"
                showIcon
                message="待办数据暂时无法加载"
                description={getErrorMessage(taskError, '请稍后刷新重试')}
              />
            )}

            <List
              className="workbench-task-list"
              loading={taskLoading}
              dataSource={tasks.slice(0, 7)}
              locale={{
                emptyText: (
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无待办事项" />
                ),
              }}
              renderItem={(task) => (
                <List.Item>
                  <Link to={task.path} className="workbench-task-row">
                    <span className={`workbench-task-kind is-${task.category.toLowerCase()}`}>
                      {task.category === 'APPROVAL' ? <SolutionOutlined /> : <UnorderedListOutlined />}
                    </span>
                    <span className="workbench-task-copy">
                      <strong>{task.title}</strong>
                      <small>{task.applicationNo} · {task.reason}</small>
                    </span>
                    <Tag bordered={false}>{task.statusLabel}</Tag>
                    <time>{task.dateKey}</time>
                    <ArrowRightOutlined />
                  </Link>
                </List.Item>
              )}
            />
          </Card>
        </main>

        <WorkspaceUtilityRail data={utilityData} />
      </div>
    </div>
  )
})
