import { Card, Button, Spin, Typography, App, Space, Tag } from 'antd';
import {
  ClockCircleOutlined,
  LogoutOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAttendance } from '../../hooks/useAttendance';
import type { AttendanceStatus } from '../../types/attendance';

const { Title, Text } = Typography;

const STATUS_CONFIG: Record<AttendanceStatus, { label: string; color: string }> = {
  not_clocked: { label: '未打卡', color: 'default' },
  working: { label: '工作中', color: 'processing' },
  completed: { label: '已完成', color: 'success' },
  late: { label: '迟到', color: 'warning' },
  early_leave: { label: '早退', color: 'error' },
  absent: { label: '缺勤', color: 'error' },
  rest: { label: '休息日', color: 'default' },
};

export default function ClockPage() {
  const { todayStatus, loading, clockingIn, clockingOut, fetchTodayStatus, clockIn, clockOut } =
    useAttendance();
  const { message } = App.useApp();

  const handleClockIn = async () => {
    const result = await clockIn();
    if (result) {
      message.success(`上班打卡成功！时间：${result.clockInTime}`);
    }
  };

  const handleClockOut = async () => {
    const result = await clockOut();
    if (result) {
      message.success(`下班打卡成功！时间：${result.clockOutTime}`);
    }
  };

  if (loading && !todayStatus) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <Spin description="加载中..." />
      </div>
    );
  }

  const status = todayStatus?.status ?? 'not_clocked';
  const statusConfig = STATUS_CONFIG[status];
  const hasClockedIn = todayStatus?.clockInTime !== null;
  const hasClockedOut = todayStatus?.clockOutTime !== null;

  return (
    <div>
      <Title level={3}>考勤打卡</Title>

      <Card style={{ maxWidth: 500 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Text type="secondary">今天是</Text>
          <div style={{ fontSize: 20, fontWeight: 600, margin: '8px 0' }}>
            {dayjs().format('YYYY年MM月DD日 dddd')}
          </div>
          <Tag color={statusConfig.color} style={{ fontSize: 14, padding: '4px 12px' }}>
            {statusConfig.label}
          </Tag>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 24 }}>
          <div style={{ textAlign: 'center' }}>
            <Text type="secondary">上班打卡</Text>
            <div style={{ fontSize: 18, fontWeight: 600, marginTop: 4 }}>
              {todayStatus?.clockInTime ?? '--:--:--'}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Text type="secondary">下班打卡</Text>
            <div style={{ fontSize: 18, fontWeight: 600, marginTop: 4 }}>
              {todayStatus?.clockOutTime ?? '--:--:--'}
            </div>
          </div>
        </div>

        {todayStatus?.workHours !== undefined && todayStatus.workHours > 0 && (
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <Text type="secondary">今日工时：{todayStatus.workHours} 小时</Text>
          </div>
        )}

        <Space style={{ width: '100%', justifyContent: 'center' }}>
          <Button
            type="primary"
            size="large"
            icon={<ClockCircleOutlined />}
            loading={clockingIn}
            disabled={hasClockedIn || clockingIn}
            onClick={handleClockIn}
          >
            上班打卡
          </Button>
          <Button
            type="primary"
            size="large"
            danger
            icon={<LogoutOutlined />}
            loading={clockingOut}
            disabled={!hasClockedIn || hasClockedOut || clockingOut}
            onClick={handleClockOut}
          >
            下班打卡
          </Button>
        </Space>

        {status === 'late' && (
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <Text type="warning">
              <ExclamationCircleOutlined /> 今日迟到，请注意打卡时间
            </Text>
          </div>
        )}
        {status === 'completed' && (
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <Text type="success">
              <CheckCircleOutlined /> 今日打卡已完成
            </Text>
          </div>
        )}
      </Card>

      <div style={{ marginTop: 16, textAlign: 'center' }}>
        <Button type="link" onClick={fetchTodayStatus} loading={loading}>
          刷新状态
        </Button>
      </div>
    </div>
  );
}
