import { useEffect, useMemo } from 'react';
import { Row, Col, Card, Spin, Statistic, Typography, Empty } from 'antd';
import {
  TeamOutlined,
  ApartmentOutlined,
  UserAddOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  EyeOutlined,
  BellOutlined,
} from '@ant-design/icons';
import { useDashboardOverview } from '../../hooks/useIntelligence';
import EChart from '../../components/EChart';
import type { EChartsOption } from 'echarts';

const { Title } = Typography;

export default function DashboardPage() {
  const { overview, loading, fetchOverview } = useDashboardOverview();

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  // 组织 - 部门分布饼图
  const orgDeptPie = useMemo<EChartsOption>(() => {
    if (!overview) return {};
    return {
      tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
      legend: { bottom: 0, type: 'scroll' },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '45%'],
          label: { show: false },
          data: overview.organization.deptDistribution,
        },
      ],
    };
  }, [overview]);

  // 组织 - 人数趋势折线图
  const orgTrendLine = useMemo<EChartsOption>(() => {
    if (!overview) return {};
    const months = overview.organization.trend.map((t) => t.month);
    const counts = overview.organization.trend.map((t) => t.count);
    return {
      tooltip: { trigger: 'axis' },
      grid: { left: 40, right: 20, top: 20, bottom: 30 },
      xAxis: { type: 'category', data: months },
      yAxis: { type: 'value', min: 'dataMin' },
      series: [{ type: 'line', data: counts, smooth: true, areaStyle: { opacity: 0.1 } }],
    };
  }, [overview]);

  // 考勤 - 状态分布饼图
  const attendanceStatusPie = useMemo<EChartsOption>(() => {
    if (!overview) return {};
    return {
      tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
      legend: { bottom: 0, type: 'scroll' },
      series: [
        {
          type: 'pie',
          radius: '65%',
          center: ['50%', '45%'],
          data: overview.attendance.statusDistribution,
        },
      ],
    };
  }, [overview]);

  // 考勤 - 趋势折线图
  const attendanceTrendLine = useMemo<EChartsOption>(() => {
    if (!overview) return {};
    const dates = overview.attendance.trend.map((t) => t.date);
    const present = overview.attendance.trend.map((t) => t.present);
    const late = overview.attendance.trend.map((t) => t.late);
    const absent = overview.attendance.trend.map((t) => t.absent);
    return {
      tooltip: { trigger: 'axis' },
      legend: { bottom: 0, data: ['出勤', '迟到', '缺勤'] },
      grid: { left: 40, right: 20, top: 20, bottom: 40 },
      xAxis: { type: 'category', data: dates },
      yAxis: { type: 'value' },
      series: [
        { name: '出勤', type: 'line', data: present, smooth: true },
        { name: '迟到', type: 'line', data: late, smooth: true },
        { name: '缺勤', type: 'line', data: absent, smooth: true },
      ],
    };
  }, [overview]);

  // 审批 - 类型分布柱状图
  const flowTypeBar = useMemo<EChartsOption>(() => {
    if (!overview) return {};
    const names = overview.flow.typeDistribution.map((t) => t.name);
    const values = overview.flow.typeDistribution.map((t) => t.value);
    return {
      tooltip: { trigger: 'axis' },
      grid: { left: 40, right: 20, top: 20, bottom: 30 },
      xAxis: { type: 'category', data: names },
      yAxis: { type: 'value' },
      series: [{ type: 'bar', data: values, itemStyle: { borderRadius: [4, 4, 0, 0] } }],
    };
  }, [overview]);

  // 审批 - 趋势折线图
  const flowTrendLine = useMemo<EChartsOption>(() => {
    if (!overview) return {};
    const months = overview.flow.trend.map((t) => t.month);
    const approved = overview.flow.trend.map((t) => t.approved);
    const rejected = overview.flow.trend.map((t) => t.rejected);
    return {
      tooltip: { trigger: 'axis' },
      legend: { bottom: 0, data: ['通过', '驳回'] },
      grid: { left: 40, right: 20, top: 20, bottom: 40 },
      xAxis: { type: 'category', data: months },
      yAxis: { type: 'value' },
      series: [
        { name: '通过', type: 'line', data: approved, smooth: true },
        { name: '驳回', type: 'line', data: rejected, smooth: true },
      ],
    };
  }, [overview]);

  // 公告 - 分类分布饼图
  const noticeCategoryPie = useMemo<EChartsOption>(() => {
    if (!overview) return {};
    return {
      tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
      legend: { bottom: 0, type: 'scroll' },
      series: [
        {
          type: 'pie',
          radius: '65%',
          center: ['50%', '45%'],
          data: overview.notice.categoryDistribution,
        },
      ],
    };
  }, [overview]);

  // 公告 - 趋势柱状图
  const noticeTrendBar = useMemo<EChartsOption>(() => {
    if (!overview) return {};
    const months = overview.notice.trend.map((t) => t.month);
    const counts = overview.notice.trend.map((t) => t.count);
    const reads = overview.notice.trend.map((t) => t.reads);
    return {
      tooltip: { trigger: 'axis' },
      legend: { bottom: 0, data: ['发布数', '阅读量'] },
      grid: { left: 40, right: 40, top: 20, bottom: 40 },
      xAxis: { type: 'category', data: months },
      yAxis: [
        { type: 'value', name: '发布数' },
        { type: 'value', name: '阅读量' },
      ],
      series: [
        { name: '发布数', type: 'bar', data: counts },
        { name: '阅读量', type: 'line', yAxisIndex: 1, data: reads, smooth: true },
      ],
    };
  }, [overview]);

  if (loading && !overview) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Spin size="large" description="加载驾驶舱数据..." />
      </div>
    );
  }

  if (!overview) {
    return (
      <div>
        <Title level={3}>数据驾驶舱</Title>
        <Empty description="暂无数据" />
      </div>
    );
  }

  const { organization, attendance, flow, notice } = overview;

  return (
    <div>
      <Title level={3}>数据驾驶舱</Title>

      {/* 组织概览 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="总人数"
              value={organization.totalEmployees}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="部门数"
              value={organization.departments}
              prefix={<ApartmentOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="本月入职"
              value={organization.newThisMonth}
              prefix={<UserAddOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="离职率"
              value={organization.turnoverRate}
              suffix="%"
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 考勤概览 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="今日出勤率"
              value={attendance.todayRate}
              suffix="%"
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="今日迟到"
              value={attendance.lateToday}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="今日缺勤"
              value={attendance.absentToday}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="请假中"
              value={attendance.onLeave}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* 审批概览 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="待审批" value={flow.pending} prefix={<ClockCircleOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="已通过"
              value={flow.approved}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="已驳回"
              value={flow.rejected}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="本月总量" value={flow.totalThisMonth} />
          </Card>
        </Col>
      </Row>

      {/* 公告概览 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="公告总数" value={notice.total} prefix={<FileTextOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="本月发布"
              value={notice.publishedThisMonth}
              prefix={<BellOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="总阅读量" value={notice.totalReads} prefix={<EyeOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="平均阅读率"
              value={notice.avgReadRate}
              suffix="%"
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 图表区域 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {/* 组织 - 部门分布 */}
        <Col xs={24} lg={12}>
          <Card title="部门人数分布">
            <EChart option={orgDeptPie} />
          </Card>
        </Col>
        {/* 组织 - 人数趋势 */}
        <Col xs={24} lg={12}>
          <Card title="人员数量趋势">
            <EChart option={orgTrendLine} />
          </Card>
        </Col>
        {/* 考勤 - 状态分布 */}
        <Col xs={24} lg={12}>
          <Card title="考勤状态分布">
            <EChart option={attendanceStatusPie} />
          </Card>
        </Col>
        {/* 考勤 - 趋势 */}
        <Col xs={24} lg={12}>
          <Card title="考勤趋势（近7天）">
            <EChart option={attendanceTrendLine} />
          </Card>
        </Col>
        {/* 审批 - 类型分布 */}
        <Col xs={24} lg={12}>
          <Card title="审批类型分布">
            <EChart option={flowTypeBar} />
          </Card>
        </Col>
        {/* 审批 - 趋势 */}
        <Col xs={24} lg={12}>
          <Card title="审批趋势">
            <EChart option={flowTrendLine} />
          </Card>
        </Col>
        {/* 公告 - 分类分布 */}
        <Col xs={24} lg={12}>
          <Card title="公告分类分布">
            <EChart option={noticeCategoryPie} />
          </Card>
        </Col>
        {/* 公告 - 趋势 */}
        <Col xs={24} lg={12}>
          <Card title="公告发布与阅读趋势">
            <EChart option={noticeTrendBar} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
