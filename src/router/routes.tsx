import type { ReactNode } from 'react'
import Home from '../views/Home'
import Login from '../views/Login'
import ApiPermissions from '../views/System/ApiPermissions'
import Departments from '../views/System/Departments'
import Employees from '../views/System/Employees'
import Menus from '../views/System/Menus'
import Positions from '../views/System/Positions'
import Roles from '../views/System/Roles'
import Clock from '../views/Attendance/Clock'
import Records from '../views/Attendance/Records'
import Statistics from '../views/Attendance/Statistics'
import MyApplications from '../views/Flow/MyApplications'
import LeaveApply from '../views/Flow/LeaveApply'
import OvertimeApply from '../views/Flow/OvertimeApply'
import TodoTasks from '../views/Flow/TodoTasks'
import DoneTasks from '../views/Flow/DoneTasks'
import NoticeList from '../views/Notice/NoticeList'
import MessageList from '../views/Notice/MessageList'
import SearchPage from '../views/Search/SearchPage'
import Assistant from '../views/AI/Assistant'
import Dashboard from '../views/Dashboard'


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
    element: <Dashboard />,
    key: 'dashboard',
    path: '/dashboard',
    title: '数据驾驶舱',
  },
  {
    element: <Clock />,
    key: 'attendance-clock',
    path: '/attendance/clock',
    title: '打卡',
  },
  {
    element: <Records />,
    key: 'attendance-records',
    path: '/attendance/records',
    title: '考勤记录',
  },
  {
    element: <Statistics />,
    key: 'attendance-statistics',
    path: '/attendance/statistics',
    title: '考勤统计',
  },
  {
    element: <MyApplications />,
    key: 'flow-applications',
    path: '/flow/applications',
    title: '我的申请',
  },
  {
    element: <LeaveApply />,
    key: 'flow-apply-leave',
    path: '/flow/apply/leave',
    title: '请假申请',
    hideInMenu: true,
  },
  {
    element: <OvertimeApply />,
    key: 'flow-apply-overtime',
    path: '/flow/apply/overtime',
    title: '加班申请',
    hideInMenu: true,
  },
  {
    element: <TodoTasks />,
    key: 'flow-tasks-todo',
    path: '/flow/tasks/todo',
    title: '待办任务',
  },
  {
    element: <DoneTasks />,
    key: 'flow-tasks-done',
    path: '/flow/tasks/done',
    title: '已办任务',
  },
  {
    element: <NoticeList />,
    key: 'notices',
    path: '/notices',
    title: '公告',
  },
  {
    element: <MessageList />,
    key: 'messages',
    path: '/messages',
    title: '消息',
  },
  {
    element: <SearchPage />,
    key: 'search',
    path: '/search',
    title: '全文检索',
  },
  {
    element: <Assistant />,
    key: 'ai-assistant',
    path: '/ai/assistant',
    title: '智能助手',
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
