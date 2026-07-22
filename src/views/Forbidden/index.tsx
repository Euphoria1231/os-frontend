import { Button, Result, Space } from 'antd'
import { useNavigate } from 'react-router-dom'

const Forbidden = () => {
  const navigate = useNavigate()

  return (
    <Result
      status="403"
      title="403"
      subTitle="当前账号没有访问该页面的权限，如需继续操作请联系管理员调整授权。"
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

export default Forbidden
