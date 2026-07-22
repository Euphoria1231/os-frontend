import type { ReactNode } from 'react'
import Home from '../views/Home'
import Login from '../views/Login'
import ApiPermissions from '../views/System/ApiPermissions'
import Departments from '../views/System/Departments'
import Employees from '../views/System/Employees'
import Menus from '../views/System/Menus'
import Positions from '../views/System/Positions'
import Roles from '../views/System/Roles'

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
    element: <Roles />,
    key: 'system-roles',
    path: '/system/roles',
    permissionCode: 'system:role:list',
    title: '角色管理',
  },
  {
    element: <Menus />,
    key: 'system-menus',
    path: '/system/menus',
    permissionCode: 'system:menu:list',
    title: '菜单管理',
  },
  {
    element: <ApiPermissions />,
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
