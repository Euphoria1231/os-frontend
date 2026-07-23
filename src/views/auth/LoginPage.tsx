import { memo, useState } from 'react'
import {
  ApartmentOutlined,
  ArrowRightOutlined,
  ClockCircleOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { App, Button, Flex, Form, Input, Space, Tag, Typography } from 'antd'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/auth/useAuth.ts'
import { RequestError } from '../../services/request.ts'
import type { LoginRequest } from '../../services/auth/auth.types.ts'
import './LoginPage.less'

const { Paragraph, Text, Title } = Typography

interface LoginLocationState {
  from?: string
}

const capabilityItems = [
  { icon: <ApartmentOutlined />, title: '组织权限', detail: '部门、岗位、员工与 RBAC' },
  { icon: <ClockCircleOutlined />, title: '协同办公', detail: '考勤、审批与公告闭环' },
  { icon: <SafetyCertificateOutlined />, title: '统一安全', detail: 'Gateway JWT 与接口鉴权' },
]

export const LoginPage = memo(function LoginPage() {
  const [submitting, setSubmitting] = useState(false)
  const { message } = App.useApp()
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const destination = (location.state as LoginLocationState | null)?.from ?? '/foundation'

  if (isAuthenticated) {
    return <Navigate to={destination} replace />
  }

  const handleSubmit = async (values: LoginRequest) => {
    setSubmitting(true)

    try {
      await login(values)
      message.success('登录成功，欢迎回来')
      navigate(destination, { replace: true })
    } catch (error) {
      const errorMessage = error instanceof RequestError ? error.message : '登录失败，请稍后重试'
      message.error(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-story-panel">
        <header className="login-brand">
          <span className="login-brand-mark" aria-hidden="true">
            OA
          </span>
          <div>
            <Text>OA WORKSPACE</Text>
            <Text>企业办公协同平台</Text>
          </div>
        </header>

        <div className="login-story-content">
          <Tag bordered={false}>WORK, CLEARLY.</Tag>
          <Title>把每一次协作，沉淀为清晰的工作进展。</Title>
          <Paragraph>
            从组织权限到考勤审批，在一个克制、稳定的工作入口中连接人与流程。
          </Paragraph>

          <div className="login-capabilities">
            {capabilityItems.map((item) => (
              <div className="login-capability" key={item.title}>
                <span>{item.icon}</span>
                <div>
                  <Text>{item.title}</Text>
                  <Text>{item.detail}</Text>
                </div>
              </div>
            ))}
          </div>
        </div>

        <footer className="login-story-footer">
          <Text>Secure access through OA Gateway</Text>
          <Text>© 2026 OA Core</Text>
        </footer>
      </section>

      <section className="login-form-panel">
        <div className="login-form-wrapper">
          <Space direction="vertical" size={8} className="login-form-heading">
            <Text className="login-form-eyebrow">EMPLOYEE ACCESS</Text>
            <Title level={2}>欢迎登录</Title>
            <Paragraph>使用员工账号进入企业办公平台</Paragraph>
          </Space>

          <Form<LoginRequest>
            layout="vertical"
            requiredMark={false}
            size="large"
            onFinish={handleSubmit}
          >
            <Form.Item
              label="员工账号"
              name="username"
              rules={[{ required: true, whitespace: true, message: '请输入员工账号' }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="请输入员工账号"
                autoComplete="username"
                maxLength={50}
              />
            </Form.Item>

            <Form.Item
              label="登录密码"
              name="password"
              rules={[{ required: true, message: '请输入登录密码' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="请输入登录密码"
                autoComplete="current-password"
                maxLength={72}
              />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              block
              loading={submitting}
              icon={<ArrowRightOutlined />}
              iconPosition="end"
              className="login-submit"
            >
              进入工作台
            </Button>
          </Form>

          <Flex justify="center" className="login-security-note">
            <SafetyCertificateOutlined />
            <Text>登录状态由 JWT 与 Gateway 安全校验保护</Text>
          </Flex>
        </div>
      </section>
    </main>
  )
})
