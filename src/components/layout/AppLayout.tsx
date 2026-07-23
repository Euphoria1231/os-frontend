import { memo, useMemo, useState } from 'react'
import {
  BellOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
} from '@ant-design/icons'
import {
  App,
  Avatar,
  Badge,
  Breadcrumb,
  Button,
  Dropdown,
  Flex,
  Layout,
  Menu,
  Tag,
  Typography,
  type MenuProps,
} from 'antd'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/auth/useAuth.ts'
import { usePersonalNotificationSummary } from '../../hooks/notice/usePersonalNotificationSummary.ts'
import { GlobalSearch } from '../search/GlobalSearch.tsx'
import { buildNavigationItems, getNavigationTrail } from './navigation.tsx'
import { WorkspaceUtilityRailContainer } from './WorkspaceUtilityRail.tsx'
import './AppLayout.less'

const { Content, Header, Sider } = Layout

function getInitials(name: string): string {
  return name.trim().slice(-2).toUpperCase()
}

export const AppLayout = memo(function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobile, setMobile] = useState(false)
  const { message } = App.useApp()
  const { user, roles, hasAuthority, logout } = useAuth()
  const { unreadCount } = usePersonalNotificationSummary()
  const location = useLocation()
  const navigate = useNavigate()
  const navigationItems = useMemo(() => buildNavigationItems(hasAuthority), [hasAuthority])
  const trail = getNavigationTrail(location.pathname)
  const displayRole = roles.has('SUPER_ADMIN')
    ? '系统管理员'
    : roles.has('DEPARTMENT_MANAGER')
      ? '部门主管'
      : '普通员工'

  const userMenu: MenuProps = {
    items: [
      {
        key: 'identity',
        label: (
          <div className="app-user-menu-identity">
            <Typography.Text strong>{user?.realName}</Typography.Text>
            <Typography.Text type="secondary">{user?.employeeNo}</Typography.Text>
          </div>
        ),
        disabled: true,
      },
      { type: 'divider' },
      { key: 'logout', label: '退出登录', icon: <LogoutOutlined /> },
    ],
    onClick: async ({ key }) => {
      if (key !== 'logout') {
        return
      }

      try {
        await logout()
        message.success('已安全退出')
      } catch {
        message.warning('退出请求未完成，本地登录状态已清除')
      } finally {
        navigate('/login', { replace: true })
      }
    },
  }

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key.startsWith('/')) {
      navigate(key)
      if (mobile) {
        setCollapsed(true)
      }
    }
  }

  return (
    <Layout className="app-shell">
      <Sider
        className="app-sider"
        width={248}
        collapsedWidth={mobile ? 0 : 76}
        collapsed={collapsed}
        breakpoint="lg"
        trigger={null}
        onBreakpoint={(broken) => {
          setMobile(broken)
          setCollapsed(broken)
        }}
      >
        <button
          className="app-brand"
          type="button"
          aria-label="返回工作台"
          onClick={() => navigate('/workspace')}
        >
          <span className="app-brand-mark">OA</span>
          {!collapsed && (
            <span className="app-brand-copy">
              <strong>OA WORKSPACE</strong>
              <small>企业办公协同平台</small>
            </span>
          )}
        </button>

        <Menu
          className="app-navigation"
          theme="dark"
          mode="inline"
          items={navigationItems}
          selectedKeys={[location.pathname]}
          defaultOpenKeys={['organization-group', 'flow-group']}
          onClick={handleMenuClick}
        />
      </Sider>

      <Layout>
        <Header className="app-header">
          <Flex className="app-header-leading" align="center" gap={18}>
            <Button
              type="text"
              className="app-collapse-trigger"
              aria-label={collapsed ? '展开侧边栏' : '收起侧边栏'}
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed((value) => !value)}
            />
            <Breadcrumb
              items={[
                { title: 'OA Workspace' },
                ...trail.map((node) => ({ title: node.label })),
              ]}
            />
          </Flex>

          <GlobalSearch />

          <Flex className="app-header-actions" align="center" justify="flex-end" gap={10}>
            <Badge count={unreadCount} size="small" overflowCount={99}>
              <Button
                type="text"
                aria-label="个人通知"
                icon={<BellOutlined />}
                onClick={() => navigate('/notifications')}
              />
            </Badge>
            <span className="app-header-divider" />
            <Dropdown menu={userMenu} placement="bottomRight" trigger={['click']}>
              <button type="button" className="app-user-trigger">
                <Avatar icon={!user?.realName ? <UserOutlined /> : undefined}>
                  {user?.realName ? getInitials(user.realName) : null}
                </Avatar>
                <span className="app-user-copy">
                  <strong>{user?.realName ?? '当前用户'}</strong>
                  <Tag bordered={false}>{displayRole}</Tag>
                </span>
              </button>
            </Dropdown>
          </Flex>
        </Header>

        <div className="app-content-frame">
          <Content className="app-content">
            <Outlet />
          </Content>
          {location.pathname !== '/workspace' && <WorkspaceUtilityRailContainer />}
        </div>
      </Layout>
    </Layout>
  )
})
