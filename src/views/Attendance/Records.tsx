import { Table, Typography, DatePicker, Space, Button, Card } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useAttendanceRecords } from '../../hooks/useAttendance';
import type { AttendanceRecord } from '../../types/attendance';
import type { AttendanceStatus } from '../../types/attendance';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const STATUS_TEXT: Record<AttendanceStatus, string> = {
  not_clocked: '未打卡',
  working: '工作中',
  completed: '正常',
  late: '迟到',
  early_leave: '早退',
  absent: '缺勤',
  rest: '休息',
};

const STATUS_COLOR: Record<AttendanceStatus, string> = {
  not_clocked: '#999',
  working: '#1677ff',
  completed: '#52c41a',
  late: '#faad14',
  early_leave: '#ff4d4f',
  absent: '#ff4d4f',
  rest: '#999',
};

const columns: ColumnsType<AttendanceRecord> = [
  {
    title: '日期',
    dataIndex: 'date',
    key: 'date',
    width: 120,
  },
  {
    title: '上班打卡',
    dataIndex: 'clockInTime',
    key: 'clockInTime',
    width: 120,
    render: (val: string | null) => val ?? '--',
  },
  {
    title: '下班打卡',
    dataIndex: 'clockOutTime',
    key: 'clockOutTime',
    width: 120,
    render: (val: string | null) => val ?? '--',
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
    render: (status: AttendanceStatus) => (
      <span style={{ color: STATUS_COLOR[status] }}>{STATUS_TEXT[status]}</span>
    ),
  },
  {
    title: '工时',
    dataIndex: 'workHours',
    key: 'workHours',
    width: 80,
    render: (hours: number) => (hours > 0 ? `${hours}h` : '--'),
  },
];

export default function RecordsPage() {
  const {
    records,
    total,
    loading,
    pageNum,
    pageSize,
    startDate,
    endDate,
    setPageNum,
    setPageSize,
    setStartDate,
    setEndDate,
    fetchRecords,
  } = useAttendanceRecords();

  const handleDateChange = (
    dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null,
  ) => {
    if (dates && dates[0] && dates[1]) {
      setPageNum(1);
      setStartDate(dates[0].format('YYYY-MM-DD'));
      setEndDate(dates[1].format('YYYY-MM-DD'));
    } else {
      setStartDate(undefined);
      setEndDate(undefined);
    }
  };

  return (
    <div>
      <Title level={3}>考勤记录</Title>

      <Card>
        <Space style={{ marginBottom: 16 }}>
          <RangePicker
            value={[startDate ? dayjs(startDate) : null, endDate ? dayjs(endDate) : null]}
            onChange={handleDateChange}
          />
          <Button icon={<ReloadOutlined />} onClick={fetchRecords}>
            刷新
          </Button>
        </Space>

        <Table<AttendanceRecord>
          columns={columns}
          dataSource={records}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pageNum,
            pageSize,
            total,
            showSizeChanger: true,
            showTotal: (t) => `共 ${t} 条`,
            onChange: (page, size) => {
              setPageNum(page);
              setPageSize(size || 10);
            },
          }}
          locale={{ emptyText: '暂无考勤记录' }}
        />
      </Card>
    </div>
  );
}
