import type { ReactNode } from 'react'
import {
  ApartmentOutlined,
  AuditOutlined,
  BellOutlined,
  ClockCircleOutlined,
  DashboardOutlined,
  IdcardOutlined,
  SafetyCertificateOutlined,
  SolutionOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import type { MenuProps } from 'antd'

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
        authority: 'GET:/api/user/**',
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
    key: '/notices',
    label: '公告通知',
    icon: <BellOutlined />,
    authority: 'GET:/api/notices/**',
  },
]

function filterNodes(
  nodes: NavigationNode[],
  hasAuthority: (authority: string) => boolean,
): NavigationNode[] {
  return nodes.flatMap((node) => {
    if (node.authority && !hasAuthority(node.authority)) {
      return []
    }

    const children = node.children ? filterNodes(node.children, hasAuthority) : undefined
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
): MenuProps['items'] {
  return toMenuItems(filterNodes(navigationNodes, hasAuthority))
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
