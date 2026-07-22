import { Empty, Typography } from 'antd'

const { Title } = Typography

export interface SystemPlaceholderProps {
  title: string
}

const SystemPlaceholder = ({ title }: SystemPlaceholderProps) => {
  return (
    <section>
      <Title level={3}>{title}</Title>
      <Empty description="页面功能将在后续任务中实现" />
    </section>
  )
}

export default SystemPlaceholder
