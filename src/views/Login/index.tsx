import { Alert, Button, Form, Input } from 'antd'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { isApiClientError } from '../../api/core'
import { useAuth } from '../../contexts/useAuth'
import type { LoginRequest } from '../../types/user'
import './index.css'

interface LoginLocationState {
  from?: {
    pathname?: string
  }
}

const Login = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const locationState = location.state as LoginLocationState | null
  const redirectPath = locationState?.from?.pathname || '/'

  const handleFinish = async (values: LoginRequest) => {
    setErrorMessage(null)
    setIsSubmitting(true)

    try {
      await login(values)
      navigate(redirectPath, { replace: true })
    } catch (error) {
      setErrorMessage(isApiClientError(error) ? error.message : '登录失败，请稍后重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-brand" aria-labelledby="login-brand-title">
        <header className="login-brand-header">
          <div className="login-brand-mark" aria-hidden="true">
            OA
          </div>
          <div>
            <span className="login-brand-kicker">OFFICE CONSOLE</span>
            <strong>OA 办公管理系统</strong>
          </div>
        </header>

        <div className="login-brand-content">
          <div className="login-brand-status">
            <span aria-hidden="true" />
            企业协同 · 安全办公
          </div>
          <h1 id="login-brand-title">企业协同办公平台</h1>
          <p className="login-brand-slogan">清晰协作，高效执行</p>

          <div className="workspace-preview" aria-label="办公运行概览">
            <div className="workspace-preview-header">
              <div>
                <span>今日工作台</span>
                <strong>组织运行概览</strong>
              </div>
              <span className="workspace-preview-live">运行正常</span>
            </div>

            <div className="workspace-preview-metrics">
              <div>
                <span>待办审批</span>
                <strong>06</strong>
              </div>
              <div>
                <span>今日在岗</span>
                <strong>92%</strong>
              </div>
              <div>
                <span>未读通知</span>
                <strong>12</strong>
              </div>
            </div>

            <div className="workspace-preview-activity" aria-hidden="true">
              <div><span /><i /></div>
              <div><span /><i /></div>
              <div><span /><i /></div>
            </div>
          </div>
        </div>

        <footer>OA OFFICE · 2026</footer>
      </section>

      <section className="login-panel" aria-label="登录表单">
        <div className="login-card">
          <div className="login-mobile-brand">
            <span aria-hidden="true">OA</span>
            <strong>OA 办公管理系统</strong>
          </div>

          <header className="login-form-header">
            <span>统一身份认证</span>
            <h2>欢迎登录</h2>
            <p>企业账号安全验证</p>
          </header>

          {errorMessage ? (
            <Alert className="login-alert" message={errorMessage} showIcon type="error" />
          ) : null}

          <Form<LoginRequest> className="login-form" layout="vertical" onFinish={handleFinish}>
            <Form.Item
              label="用户名"
              name="username"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input autoComplete="username" placeholder="请输入用户名" size="large" />
            </Form.Item>
            <Form.Item
              label="密码"
              name="password"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password
                autoComplete="current-password"
                placeholder="请输入密码"
                size="large"
              />
            </Form.Item>
            <Button
              aria-label="登录"
              block
              className="login-submit"
              htmlType="submit"
              loading={isSubmitting}
              size="large"
              type="primary"
            >
              登录
            </Button>
          </Form>

          <p className="login-security-note">
            <span aria-hidden="true" />
            内部办公系统 · 安全访问
          </p>
        </div>
      </section>
    </main>
  )
}

export default Login
