import { Button, Result } from 'antd'
import { Component, type ErrorInfo, type ReactNode } from 'react'

export interface AppErrorBoundaryProps {
  children: ReactNode
}

interface AppErrorBoundaryState {
  hasError: boolean
}

class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = {
    hasError: false,
  }

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Page render failed', {
      componentStack: errorInfo.componentStack,
      message: error.message,
    })
  }

  handleRetry = () => {
    this.setState({ hasError: false })
  }

  render() {
    if (this.state.hasError) {
      return (
        <Result
          status="error"
          title="页面暂时无法显示"
          subTitle="请重试，或返回其他页面后再打开。"
          extra={
            <Button type="primary" onClick={this.handleRetry}>
              重试
            </Button>
          }
        />
      )
    }

    return this.props.children
  }
}

export default AppErrorBoundary
