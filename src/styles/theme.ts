import type { ThemeConfig } from 'antd'

export const oaTheme: ThemeConfig = {
  token: {
    colorPrimary: '#16745f',
    colorInfo: '#16745f',
    colorSuccess: '#1f8a70',
    colorWarning: '#c9852b',
    colorError: '#c94a4a',
    colorText: '#243746',
    colorTextSecondary: '#647586',
    colorBgLayout: '#f5f8fa',
    colorBorder: '#dbe4ea',
    borderRadius: 10,
    controlHeight: 38,
    fontFamily: "'Noto Sans SC', 'Source Han Sans SC', 'Microsoft YaHei', sans-serif",
  },
  components: {
    Button: {
      borderRadius: 9,
      primaryShadow: '0 8px 20px rgba(22, 116, 95, 0.18)',
    },
    Card: {
      borderRadiusLG: 16,
    },
    Table: {
      headerBg: '#f5f8fa',
      headerColor: '#415566',
    },
  },
}
