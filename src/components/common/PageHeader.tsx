import { memo, type ReactNode } from 'react'
import { Flex, Typography } from 'antd'
import './PageHeader.less'

interface PageHeaderProps {
  eyebrow?: string
  title: string
  description: string
  extra?: ReactNode
}

export const PageHeader = memo(function PageHeader({
  eyebrow,
  title,
  description,
  extra,
}: PageHeaderProps) {
  return (
    <Flex className="page-header" justify="space-between" align="end" gap={24}>
      <div>
        {eyebrow && <Typography.Text className="page-header-eyebrow">{eyebrow}</Typography.Text>}
        <Typography.Title level={2}>{title}</Typography.Title>
        <Typography.Paragraph>{description}</Typography.Paragraph>
      </div>
      {extra && <div className="page-header-extra">{extra}</div>}
    </Flex>
  )
})
