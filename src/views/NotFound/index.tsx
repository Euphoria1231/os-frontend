import { Button, Result, Space } from 'antd'
import { useNavigate } from 'react-router-dom'

const NotFound = () => {
  const navigate = useNavigate()

  return (
    <Result
      status="404"
      title="404"
      subTitle="页面不存在、已被移动，或当前地址输入有误。"
      extra={
        <Space>
          <Button onClick={() => navigate(-1)}>返回上一页</Button>
          <Button type="primary" onClick={() => navigate('/')}>
            返回首页
          </Button>
        </Space>
      }
    />
  )
}

export default NotFound
