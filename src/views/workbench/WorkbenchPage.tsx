import { memo } from 'react'
import {
  ArrowRightOutlined,
  BellOutlined,
  ClockCircleOutlined,
  SafetyCertificateOutlined,
  SolutionOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import { Card, Col, Flex, Row, Tag, Typography } from 'antd'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/auth/useAuth.ts'
import './WorkbenchPage.less'

const { Paragraph, Text, Title } = Typography

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
  const { user, hasAuthority, roles } = useAuth()
  const visibleCards = moduleCards.filter((item) => hasAuthority(item.authority))
  const dateLabel = new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(new Date())

  return (
    <div className="workbench-page">
      <section className="workbench-hero">
        <div>
          <Tag bordered={false}>WORKBENCH</Tag>
          <Title level={1}>
            {getGreeting()}，{user?.realName ?? '同事'}
          </Title>
          <Paragraph>{dateLabel}，欢迎回到你的办公工作台。</Paragraph>
        </div>
        <div className="workbench-identity-card">
          <span>
            <SafetyCertificateOutlined />
          </span>
          <div>
            <Text>当前身份</Text>
            <Text strong>
              {roles.has('SUPER_ADMIN')
                ? '系统管理员'
                : roles.has('DEPARTMENT_MANAGER')
                  ? '部门主管'
                  : '普通员工'}
            </Text>
          </div>
        </div>
      </section>

      <section className="workbench-section">
        <Flex justify="space-between" align="end" className="workbench-section-heading">
          <div>
            <Text className="workbench-eyebrow">CORE MODULES</Text>
            <Title level={3}>常用工作入口</Title>
          </div>
          <Text type="secondary">入口根据当前账号权限自动呈现</Text>
        </Flex>

        <Row gutter={[18, 18]}>
          {visibleCards.map((item) => (
            <Col xs={24} md={12} xl={6} key={item.path}>
              <Link to={item.path} className="workbench-module-link">
                <Card bordered={false} className={`workbench-module-card tone-${item.tone}`}>
                  <Flex vertical gap={24}>
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

      <section className="workbench-system-note">
        <div>
          <Text className="workbench-eyebrow">SECURITY BOUNDARY</Text>
          <Title level={4}>统一入口，清晰边界</Title>
          <Paragraph>
            所有业务请求统一经过 Gateway；前端菜单仅改善使用体验，真实接口权限始终由后端校验。
          </Paragraph>
        </div>
        <div className="workbench-system-path">
          <span>WEB</span>
          <i />
          <span>GATEWAY</span>
          <i />
          <span>SERVICE</span>
        </div>
      </section>
    </div>
  )
})
