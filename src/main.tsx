import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App as AntdApp, ConfigProvider } from 'antd'
import 'antd/dist/reset.css'
import App from './App.tsx'
import { oaTheme } from './styles/theme.ts'
import './styles/global.less'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider theme={oaTheme}>
      <AntdApp>
        <App />
      </AntdApp>
    </ConfigProvider>
  </StrictMode>,
)
