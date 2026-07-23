import { memo } from 'react'
import { Badge, Card, Flex, Progress, Space, Tag, Typography } from 'antd'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/auth/ProtectedRoute.tsx'
import { LoginPage } from './views/auth/LoginPage.tsx'
import './App.less'

const { Paragraph, Text, Title } = Typography

const FoundationPage = memo(function FoundationPage() {
  return (
    <main className="foundation-page">
      <header className="foundation-header">
        <Flex align="center" gap={12}>
          <span className="foundation-logo" aria-hidden="true">
            OA
          </span>
          <div>
            <Text className="foundation-brand">OA WORKSPACE</Text>
            <Text className="foundation-brand-subtitle">企业办公协同平台</Text>
          </div>
        </Flex>
        <Badge status="processing" text="基础框架运行中" />
      </header>

      <section className="foundation-content">
        <div className="foundation-intro">
          <Tag bordered={false} className="foundation-kicker">
            ENTERPRISE FOUNDATION
          </Tag>
          <Title level={1}>让组织协作，从清晰的工作入口开始。</Title>
          <Paragraph>
            统一请求、主题系统与路由骨架已经接入。后续登录、组织权限、考勤、审批和公告模块将在同一设计体系下逐步完成。
          </Paragraph>
          <Space size={[8, 10]} wrap>
            <Tag>Ant Design</Tag>
            <Tag>React Context</Tag>
            <Tag>TypeScript</Tag>
            <Tag>Less</Tag>
          </Space>
        </div>

        <Card className="foundation-card" bordered={false}>
          <Flex vertical gap={24}>
            <div>
              <Text className="foundation-card-eyebrow">SYSTEM READINESS</Text>
              <Title level={3}>前端基础设施</Title>
              <Paragraph>保持依赖克制，让业务页面拥有一致、稳定、可维护的底座。</Paragraph>
            </div>

            <div className="foundation-progress">
              <Flex justify="space-between" align="center">
                <Text strong>基础框架</Text>
                <Text type="secondary">1 / 10</Text>
              </Flex>
              <Progress percent={10} showInfo={false} strokeColor="#1f8a70" />
            </div>

            <div className="foundation-capabilities">
              <div>
                <Text strong>中心 Request</Text>
                <Text type="secondary">统一响应与错误边界</Text>
              </div>
              <div>
                <Text strong>Router</Text>
                <Text type="secondary">为权限路由预留入口</Text>
              </div>
              <div>
                <Text strong>Design Tokens</Text>
                <Text type="secondary">企业级主题与间距规范</Text>
              </div>
            </div>
          </Flex>
        </Card>
      </section>

      <footer className="foundation-footer">
        <Text>OA Core · React + TypeScript</Text>
        <Text>Gateway /api</Text>
      </footer>
    </main>
  )
})

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/foundation"
          element={
            <ProtectedRoute>
              <FoundationPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/foundation" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
