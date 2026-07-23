import { memo } from 'react'
import {
  ApiOutlined,
  MenuOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons'
import { Alert, Button, Card, Col, Row, Statistic, Tabs } from 'antd'
import { PageHeader } from '../../components/common/PageHeader.tsx'
import { useRbacData } from '../../hooks/rbac/useRbacData.ts'
import { getErrorMessage } from '../../utils/error.ts'
import { ApiPermissionPanel } from './ApiPermissionPanel.tsx'
import { MenuPanel } from './MenuPanel.tsx'
import { RolePanel } from './RolePanel.tsx'
import './PermissionPage.less'

export const PermissionPage = memo(function PermissionPage() {
  const controller = useRbacData()
  const { roles, menus, apiPermissions, loading, error, reload } = controller

  return (
    <section className="permission-page">
      <PageHeader
        eyebrow="SECURITY / RBAC"
        title="权限管理"
        description="以角色为核心配置菜单可见性和接口访问边界，前后端权限标识保持统一。"
        extra={
          <Button icon={<ReloadOutlined />} loading={loading} onClick={() => void reload()}>
            刷新权限数据
          </Button>
        }
      />

      <Row gutter={[14, 14]} className="permission-stats">
        <Col xs={24} sm={8}>
          <Card bordered={false}>
            <Statistic title="角色" value={roles.length} suffix="个" prefix={<SafetyCertificateOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false}>
            <Statistic title="菜单权限" value={menus.length} suffix="项" prefix={<MenuOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false}>
            <Statistic title="接口权限" value={apiPermissions.length} suffix="项" prefix={<ApiOutlined />} />
          </Card>
        </Col>
      </Row>

      {error && (
        <Alert
          className="permission-alert"
          type="warning"
          showIcon
          message="权限数据暂时无法加载"
          description={getErrorMessage(error, '请稍后重试')}
          action={
            <Button size="small" icon={<ReloadOutlined />} onClick={() => void reload()}>
              重新加载
            </Button>
          }
        />
      )}

      <Card bordered={false} className="permission-workspace">
        <Tabs
          destroyOnHidden
          items={[
            {
              key: 'roles',
              label: '角色配置',
              icon: <SafetyCertificateOutlined />,
              children: <RolePanel controller={controller} />,
            },
            {
              key: 'menus',
              label: '菜单权限',
              icon: <MenuOutlined />,
              children: <MenuPanel controller={controller} />,
            },
            {
              key: 'apis',
              label: '接口权限',
              icon: <ApiOutlined />,
              children: <ApiPermissionPanel controller={controller} />,
            },
          ]}
        />
      </Card>
    </section>
  )
})
