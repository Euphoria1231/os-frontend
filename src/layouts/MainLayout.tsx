import { Breadcrumb, Button, Dropdown, Layout, Menu, Typography, type MenuProps } from 'antd'
import { useMemo, useState, type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'
import { appRoutes, findRouteByPath } from '../router/routes'
import './MainLayout.css'

const { Content, Header, Sider } = Layout
const { Text } = Typography

export interface MainLayoutProps {
  children: ReactNode
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const [collapsed, setCollapsed] = useState(false)
  const { currentUser, hasPermission, logout, menus } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const currentRoute = findRouteByPath(location.pathname)
  const menuPaths = useMemo(() => new Set(menus.map((menu) => menu.path)), [menus])

  const canShowRoute = (permissionCode?: string, path?: string) => {
    if (!permissionCode) {
      return true
    }

    return hasPermission(permissionCode) || Boolean(path && menuPaths.has(path))
  }

  const systemMenuItems = appRoutes
    .filter((route) => route.path.startsWith('/system/'))
    .filter((route) => !route.hideInMenu && canShowRoute(route.permissionCode, route.path))
    .map((route) => ({
      key: route.path,
      label: <Link to={route.path}>{route.title}</Link>,
    }))

  const menuItems: MenuProps['items'] = [
    {
      key: '/',
      label: <Link to="/">首页</Link>,
    },
    ...(systemMenuItems.length
      ? [
          {
            children: systemMenuItems,
            key: 'system',
            label: '系统管理',
          },
        ]
      : []),
  ]

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'logout',
      label: '退出登录',
      onClick: async () => {
        await logout()
        navigate('/login', { replace: true })
      },
    },
  ]

  return (
    <Layout className="main-layout">
      <Sider
        breakpoint="md"
        className="main-layout__sider"
        collapsible
        collapsed={collapsed}
        collapsedWidth={72}
        onCollapse={setCollapsed}
        width={216}
      >
        <div className="main-layout__brand">
          {collapsed ? 'OA' : 'OA 办公'}
        </div>
        <Menu
          items={menuItems}
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={location.pathname.startsWith('/system/') ? ['system'] : []}
          theme="dark"
        />
      </Sider>
      <Layout className="main-layout__body">
        <Header className="main-layout__header">
          <Breadcrumb
            className="main-layout__breadcrumb"
            items={[
              { title: <Link to="/">首页</Link> },
              ...(currentRoute && currentRoute.path !== '/' ? [{ title: currentRoute.title }] : []),
            ]}
          />
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Button className="main-layout__user-button" type="text">
              <Text strong>{currentUser?.displayName ?? currentUser?.username ?? '用户'}</Text>
            </Button>
          </Dropdown>
        </Header>
        <Content className="main-layout__content">
          <div className="main-layout__panel">{children}</div>
        </Content>
      </Layout>
    </Layout>
  )
}

export default MainLayout
