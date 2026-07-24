import type { ReactNode } from 'react'
import {
  ApartmentOutlined,
  AuditOutlined,
  BellOutlined,
  ClockCircleOutlined,
  DashboardOutlined,
  FileSearchOutlined,
  IdcardOutlined,
  SafetyCertificateOutlined,
  SolutionOutlined,
  TeamOutlined,
  RobotOutlined,
  NotificationOutlined,
  UserOutlined,
} from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { canAccessEmployeeSelfServicePath } from '../auth/employee-self-service.logic.ts'

export interface NavigationNode {
  key: string
  label: string
  icon?: ReactNode
  authority?: string
  children?: NavigationNode[]
}

export const navigationNodes: NavigationNode[] = [
  {
    key: '/workspace',
    label: '工作台',
    icon: <DashboardOutlined />,
  },
  {
    key: 'organization-group',
    label: '组织管理',
    icon: <ApartmentOutlined />,
    children: [
      {
        key: '/organization/departments',
        label: '部门管理',
        icon: <ApartmentOutlined />,
        authority: 'GET:/api/user/**',
      },
      {
        key: '/organization/positions',
        label: '岗位管理',
        icon: <IdcardOutlined />,
        authority: 'GET:/api/user/**',
      },
      {
        key: '/employees',
        label: '员工管理',
        icon: <TeamOutlined />,
        authority: 'GET:/api/user/employees/direct-reports',
      },
      {
        key: '/permissions',
        label: '权限管理',
        icon: <SafetyCertificateOutlined />,
        authority: 'GET:/api/user/**',
      },
    ],
  },
  {
    key: '/attendance',
    label: '考勤打卡',
    icon: <ClockCircleOutlined />,
    authority: 'GET:/api/attendance/**',
  },
  {
    key: 'flow-group',
    label: '流程审批',
    icon: <SolutionOutlined />,
    children: [
      {
        key: '/flow/applications',
        label: '我的申请',
        icon: <SolutionOutlined />,
        authority: 'GET:/api/flow/applications/**',
      },
      {
        key: '/flow/approvals',
        label: '审批中心',
        icon: <AuditOutlined />,
        authority: 'GET:/api/flow/tasks/**',
      },
    ],
  },
  {
    key: '/notifications',
    label: '个人通知',
    icon: <NotificationOutlined />,
  },
  {
    key: '/notices',
    label: '公告通知',
    icon: <BellOutlined />,
    authority: 'GET:/api/notices/**',
  },
  {
    key: '/ai/assistant',
    label: '智能办公',
    icon: <RobotOutlined />,
    authority: 'POST:/api/intelligence/ai/**',
  },
  {
    key: '/operation-logs',
    label: '操作日志',
    icon: <FileSearchOutlined />,
  },
  {
    key: '/profile',
    label: '个人中心',
    icon: <UserOutlined />,
  },
]

function filterNodes(
  nodes: NavigationNode[],
  hasAuthority: (authority: string) => boolean,
  isSuperAdmin: boolean,
): NavigationNode[] {
  return nodes.flatMap((node) => {
    if (!canAccessEmployeeSelfServicePath(node.key, isSuperAdmin)) {
      return []
    }

    if (node.authority && !hasAuthority(node.authority)) {
      return []
    }

    const children = node.children
      ? filterNodes(node.children, hasAuthority, isSuperAdmin)
      : undefined
    if (node.children && !children?.length) {
      return []
    }

    return [{ ...node, children }]
  })
}

function toMenuItems(nodes: NavigationNode[]): MenuProps['items'] {
  return nodes.map((node) => ({
    key: node.key,
    label: node.label,
    icon: node.icon,
    children: node.children ? toMenuItems(node.children) : undefined,
  }))
}

export function buildNavigationItems(
  hasAuthority: (authority: string) => boolean,
  isSuperAdmin = false,
): MenuProps['items'] {
  return toMenuItems(filterNodes(navigationNodes, hasAuthority, isSuperAdmin))
}

function findTrail(nodes: NavigationNode[], pathname: string): NavigationNode[] {
  for (const node of nodes) {
    if (node.key === pathname) {
      return [node]
    }

    if (node.children) {
      const childTrail = findTrail(node.children, pathname)
      if (childTrail.length) {
        return [node, ...childTrail]
      }
    }
  }

  return []
}

export function getNavigationTrail(pathname: string): NavigationNode[] {
  return findTrail(navigationNodes, pathname)
}
