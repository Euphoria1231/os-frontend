import { Card, Form, Input, Button, DatePicker, TimePicker, InputNumber, Typography, App, Space } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useOvertimeApply } from '../../hooks/useFlow';

const { Title } = Typography;
const { TextArea } = Input;

export default function OvertimeApplyPage() {
  const navigate = useNavigate();
  const { submitting, submit } = useOvertimeApply();
  const { message } = App.useApp();
  const [form] = Form.useForm();

  const handleSubmit = async (values: {
    date: dayjs.Dayjs;
    timeRange: [dayjs.Dayjs, dayjs.Dayjs];
    reason: string;
  }) => {
    const startTime = values.timeRange[0].format('HH:mm');
    const endTime = values.timeRange[1].format('HH:mm');
    const hours = values.timeRange[1].diff(values.timeRange[0], 'hour', true);

    if (hours <= 0) {
      message.error('结束时间必须晚于开始时间');
      return;
    }

    const success = await submit({
      date: values.date.format('YYYY-MM-DD'),
      startTime,
      endTime,
      hours: Math.round(hours * 10) / 10,
      reason: values.reason,
    });
    if (success) {
      message.success('加班申请提交成功');
      navigate('/flow/applications');
    }
  };

  return (
    <div>
      <Title level={3}>加班申请</Title>

      <Card style={{ maxWidth: 600 }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Form.Item
            label="加班日期"
            name="date"
            rules={[{ required: true, message: '请选择加班日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="加班时间段"
            name="timeRange"
            rules={[
              { required: true, message: '请选择加班时间段' },
              {
                validator: (_, value: [dayjs.Dayjs, dayjs.Dayjs] | undefined) => {
                  if (value && value[0] && value[1]) {
                    if (!value[1].isAfter(value[0])) {
                      return Promise.reject('结束时间必须晚于开始时间');
                    }
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <TimePicker.RangePicker style={{ width: '100%' }} format="HH:mm" />
          </Form.Item>

          <Form.Item
            label="加班原因"
            name="reason"
            rules={[
              { required: true, message: '请填写加班原因' },
              { max: 200, message: '原因不能超过200字' },
            ]}
          >
            <TextArea rows={4} placeholder="请简要说明加班原因" showCount maxLength={200} />
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
