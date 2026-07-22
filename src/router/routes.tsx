import type { ReactNode } from 'react'
import Home from '../views/Home'
import Login from '../views/Login'
import Departments from '../views/System/Departments'
import Employees from '../views/System/Employees'
import SystemPlaceholder from '../views/System/Placeholder'
import Positions from '../views/System/Positions'

export interface AppRoute {
  element: ReactNode
  key: string
  path: string
  permissionCode?: string
  title: string
  hideInMenu?: boolean
}

export const appRoutes: AppRoute[] = [
  {
    element: <Home />,
    key: 'home',
    path: '/',
    title: '首页',
  },
  {
    element: <Departments />,
    key: 'system-departments',
    path: '/system/departments',
    permissionCode: 'system:department:list',
    title: '部门管理',
  },
  {
    element: <Positions />,
    key: 'system-positions',
    path: '/system/positions',
    permissionCode: 'system:position:list',
    title: '岗位管理',
  },
  {
    element: <Employees />,
    key: 'system-employees',
    path: '/system/employees',
    permissionCode: 'system:employee:list',
    title: '员工管理',
  },
  {
    element: <SystemPlaceholder title="角色管理" />,
    key: 'system-roles',
    path: '/system/roles',
    permissionCode: 'system:role:list',
    title: '角色管理',
  },
  {
    element: <SystemPlaceholder title="菜单管理" />,
    key: 'system-menus',
    path: '/system/menus',
    permissionCode: 'system:menu:list',
    title: '菜单管理',
  },
  {
    element: <SystemPlaceholder title="接口权限" />,
    key: 'system-api-permissions',
    path: '/system/api-permissions',
    permissionCode: 'system:api-permission:list',
    title: '接口权限',
  },
]

export const publicRoutes: AppRoute[] = [
  {
    element: <Login />,
    hideInMenu: true,
    key: 'login',
    path: '/login',
    title: '登录',
  },
]

export const findRouteByPath = (pathname: string) =>
  [...appRoutes, ...publicRoutes].find((route) => route.path === pathname)
