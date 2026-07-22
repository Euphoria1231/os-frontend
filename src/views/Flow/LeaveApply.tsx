import { Card, Form, Input, Button, Select, DatePicker, Typography, App, Space } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useLeaveApply } from '../../hooks/useFlow';
import type { LeaveType } from '../../types/flow';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

const LEAVE_TYPES: { label: string; value: LeaveType }[] = [
  { label: '年假', value: 'annual_leave' },
  { label: '病假', value: 'sick_leave' },
  { label: '事假', value: 'personal_leave' },
  { label: '婚假', value: 'marriage_leave' },
  { label: '产假', value: 'maternity_leave' },
];

export default function LeaveApplyPage() {
  const navigate = useNavigate();
  const { submitting, submit } = useLeaveApply();
  const { message } = App.useApp();
  const [form] = Form.useForm();

  const handleSubmit = async (values: {
    type: LeaveType;
    dateRange: [dayjs.Dayjs, dayjs.Dayjs];
    reason: string;
  }) => {
    const success = await submit({
      type: values.type,
      startDate: values.dateRange[0].format('YYYY-MM-DD'),
      endDate: values.dateRange[1].format('YYYY-MM-DD'),
      reason: values.reason,
    });
    if (success) {
      message.success('请假申请提交成功');
      navigate('/flow/applications');
    }
  };

  return (
    <div>
      <Title level={3}>请假申请</Title>

      <Card style={{ maxWidth: 600 }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Form.Item
            label="请假类型"
            name="type"
            rules={[{ required: true, message: '请选择请假类型' }]}
          >
            <Select options={LEAVE_TYPES} placeholder="请选择请假类型" />
          </Form.Item>

          <Form.Item
            label="请假时间"
            name="dateRange"
            rules={[
              { required: true, message: '请选择请假时间' },
              {
                validator: (_, value: [dayjs.Dayjs, dayjs.Dayjs] | undefined) => {
                  if (value && value[0] && value[1]) {
                    if (value[1].isBefore(value[0], 'day')) {
                      return Promise.reject('结束日期不能早于开始日期');
                    }
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="请假原因"
            name="reason"
            rules={[
              { required: true, message: '请填写请假原因' },
              { max: 200, message: '原因不能超过200字' },
            ]}
          >
            <TextArea rows={4} placeholder="请简要说明请假原因" showCount maxLength={200} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={submitting}>
                提交申请
              </Button>
              <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/flow/applications')}>
                返回
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
