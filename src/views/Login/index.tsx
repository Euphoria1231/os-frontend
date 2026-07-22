import { Alert, Button, Form, Input, Typography } from 'antd'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { isApiClientError } from '../../api/core'
import { useAuth } from '../../contexts/useAuth'
import type { LoginRequest } from '../../types/user'

const { Title } = Typography

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
    <main style={{ maxWidth: 360, margin: '96px auto', padding: '0 16px' }}>
      <Title level={2}>OA 办公管理系统</Title>
      {errorMessage ? (
        <Alert message={errorMessage} showIcon type="error" style={{ marginBottom: 16 }} />
      ) : null}
      <Form<LoginRequest> layout="vertical" onFinish={handleFinish}>
        <Form.Item
          label="用户名"
          name="username"
          rules={[{ required: true, message: '请输入用户名' }]}
        >
          <Input autoComplete="username" />
        </Form.Item>
        <Form.Item
          label="密码"
          name="password"
          rules={[{ required: true, message: '请输入密码' }]}
        >
          <Input.Password autoComplete="current-password" />
        </Form.Item>
        <Button aria-label="登录" block htmlType="submit" loading={isSubmitting} type="primary">
          登录
        </Button>
      </Form>
    </main>
  )
}

export default Login
