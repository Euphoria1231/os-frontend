import { memo } from 'react'
import { ArrowRightOutlined, BuildOutlined } from '@ant-design/icons'
import { Card, Flex, Tag, Typography } from 'antd'
import './ModulePlaceholder.less'

interface ModulePlaceholderProps {
  title: string
  description: string
}

export const ModulePlaceholder = memo(function ModulePlaceholder({
  title,
  description,
}: ModulePlaceholderProps) {
  return (
    <section className="module-placeholder">
      <Card bordered={false}>
        <Flex vertical align="center" gap={16}>
          <span className="module-placeholder-icon">
            <BuildOutlined />
          </span>
          <Tag bordered={false}>MODULE READY</Tag>
          <Typography.Title level={2}>{title}</Typography.Title>
          <Typography.Paragraph>{description}</Typography.Paragraph>
          <Typography.Text type="secondary">
            该模块将在后续功能提交中接入真实接口 <ArrowRightOutlined />
          </Typography.Text>
        </Flex>
      </Card>
    </section>
  )
})
