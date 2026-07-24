import { memo } from 'react'
import {
  IdcardOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { Avatar, Card, Descriptions, Empty, Flex, Tag, Typography } from 'antd'
import { PageHeader } from '../../components/common/PageHeader.tsx'
import { StatusTag } from '../../components/common/StatusTag.tsx'
import { useAuth } from '../../hooks/auth/useAuth.ts'
import { buildProfileDetails } from './profile.logic.ts'
import './ProfilePage.less'

function getInitials(name: string): string {
  return name.trim().slice(-2).toUpperCase()
}

export const ProfilePage = memo(function ProfilePage() {
  const { user, roles } = useAuth()

  if (!user) {
    return (
      <Card bordered={false} className="profile-empty-card">
        <Empty description="暂未获取到个人信息" />
      </Card>
    )
  }

  const roleLabel = roles.has('SUPER_ADMIN')
    ? '系统管理员'
    : roles.has('DEPARTMENT_MANAGER')
      ? '部门主管'
      : '普通员工'
  const details = buildProfileDetails(user)

  return (
    <section className="profile-page">
      <PageHeader
        eyebrow="MY PROFILE"
        title="个人中心"
        description="查看当前登录账号的员工档案与组织信息。"
      />

      <div className="profile-content-grid">
        <Card bordered={false} className="profile-identity-card">
          <div className="profile-identity-orbit" aria-hidden="true" />
          <div className="profile-avatar-ring">
            <Avatar size={76} icon={!user.realName ? <UserOutlined /> : undefined}>
              {user.realName ? getInitials(user.realName) : null}
            </Avatar>
          </div>
          <Typography.Title level={3}>{user.realName}</Typography.Title>
          <Typography.Text className="profile-employee-number">
            {user.employeeNo}
          </Typography.Text>

          <Flex className="profile-tags" justify="center" wrap gap={8}>
            <StatusTag status={user.status} />
            <Tag bordered={false} icon={<SafetyCertificateOutlined />}>
              {roleLabel}
            </Tag>
          </Flex>

          <div className="profile-organization-summary">
            <span>
              <TeamOutlined />
              {user.departmentName ?? '未分配部门'}
            </span>
            <span>
              <IdcardOutlined />
              {user.positionName ?? '未分配岗位'}
            </span>
          </div>
        </Card>

        <Card bordered={false} className="profile-detail-card">
          <div className="profile-detail-heading">
            <div>
              <Typography.Text className="profile-detail-eyebrow">
                EMPLOYEE RECORD
              </Typography.Text>
              <Typography.Title level={3}>基本信息</Typography.Title>
            </div>
            <Typography.Text type="secondary">信息来源于当前登录员工档案</Typography.Text>
          </div>

          <Descriptions
            className="profile-descriptions"
            colon={false}
            column={{ xs: 1, sm: 1, md: 2 }}
            items={details.map((detail) => ({
              key: detail.key,
              label: detail.label,
              children: detail.value,
            }))}
          />
        </Card>
      </div>
    </section>
  )
})
