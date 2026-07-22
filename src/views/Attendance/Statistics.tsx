import { Card, Spin, Statistic, Row, Col, Typography, Empty, Button, Space, App } from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import { useState } from 'react';
import { useAttendanceStatistics } from '../../hooks/useAttendance';
import * as attendanceApi from '../../api/attendance';

const { Title } = Typography;

export default function StatisticsPage() {
  const { statistics, loading } = useAttendanceStatistics();
  const { message } = App.useApp();
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      const blob = await attendanceApi.downloadReport();
      // 验证返回的是文件而不是错误 JSON
      if (blob.type && blob.type.includes('application/json')) {
        message.error('下载失败：服务器返回了错误信息');
        return;
      }
      if (blob.size === 0) {
        message.error('下载失败：文件为空');
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `考勤报表_${new Date().toISOString().slice(0, 10)}.xls`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      message.success('报表下载成功');
    } catch {
      message.error('报表下载失败，请稍后重试');
    } finally {
      setDownloading(false);
    }
  };

  if (loading && !statistics) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <Spin description="加载中..." />
      </div>
    );
  }

  if (!statistics) {
    return (
      <div>
        <Title level={3}>考勤统计</Title>
        <Empty description="暂无统计数据" />
      </div>
    );
  }

  return (
    <div>
      <Space style={{ justifyContent: 'space-between', width: '100%', marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>考勤统计</Title>
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          loading={downloading}
          onClick={handleDownload}
        >
          下载月度报表
        </Button>
      </Space>

      <Row gutter={[16, 16]}>
        <Col xs={12} sm={8} md={6}>
          <Card>
            <Statistic
              title="应出勤天数"
              value={statistics.totalDays}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6}>
          <Card>
            <Statistic
              title="正常出勤"
              value={statistics.normalDays}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6}>
          <Card>
            <Statistic
              title="迟到"
              value={statistics.lateDays}
              valueStyle={{ color: '#faad14' }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6}>
          <Card>
            <Statistic
              title="缺勤"
              value={statistics.absentDays}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={12} sm={8}>
          <Card>
            <Statistic title="早退" value={statistics.earlyLeaveDays} />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card>
            <Statistic title="平均上班时间" value={statistics.avgClockIn} />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card>
            <Statistic
              title="平均工时"
              value={statistics.avgWorkHours}
              suffix="小时"
              precision={1}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
