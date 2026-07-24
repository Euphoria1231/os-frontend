import { useMemo, useState } from 'react'
import {
  LineChartOutlined,
  ReloadOutlined,
  RobotOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { Alert, App, Button, Card, DatePicker, Empty, Select, Tag, Typography } from 'antd'
import dayjs, { type Dayjs } from 'dayjs'
import { useEmployees } from '../../hooks/employee/useEmployees.ts'
import { intelligenceService } from '../../services/intelligence/intelligence.service.ts'
import type { AttendanceAnalysisResponse } from '../../services/intelligence/intelligence.types.ts'
import { getErrorMessage } from '../../utils/error.ts'
import { AnalysisResultCard } from './AnalysisResultCard.tsx'

const RISK_LEVEL_LABELS: Record<string, string> = {
  LOW: '低风险',
  MEDIUM: '中风险',
  HIGH: '高风险',
}

const RISK_LEVEL_COLORS: Record<string, string> = {
  LOW: 'success',
  MEDIUM: 'warning',
  HIGH: 'error',
}

export function AttendanceAnalysisPanel() {
  const [month, setMonth] = useState<Dayjs>(() => dayjs().startOf('month'))
  const [preferredEmployeeId, setPreferredEmployeeId] = useState<number | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisError, setAnalysisError] = useState<unknown>(null)
  const [analysis, setAnalysis] = useState<AttendanceAnalysisResponse | null>(null)
  const { message } = App.useApp()
  const {
    employees: directReports,
    loading: loadingDirectReports,
    error: directReportsError,
    reload: reloadDirectReports,
  } = useEmployees('direct-reports')

  const selectedEmployeeId = useMemo(() => (
    preferredEmployeeId !== null
      && directReports.some((employee) => employee.id === preferredEmployeeId)
      ? preferredEmployeeId
      : directReports[0]?.id ?? null
  ), [directReports, preferredEmployeeId])

  const selectedEmployee = useMemo(
    () => directReports.find((employee) => employee.id === selectedEmployeeId) ?? null,
    [directReports, selectedEmployeeId],
  )

  const analyzeAttendance = async () => {
    if (selectedEmployeeId === null) {
      message.warning('请先选择需要分析的直属员工')
      return
    }

    setAnalyzing(true)
    setAnalysisError(null)
    try {
      setAnalysis(await intelligenceService.analyzeAttendance(
        selectedEmployeeId,
        month.format('YYYY-MM'),
      ))
      message.success('月度考勤分析已生成')
    } catch (error) {
      setAnalysisError(error)
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <div className="intelligence-workspace">
      <div className="intelligence-control-column">
        <Card bordered={false} className="intelligence-control-card">
          <Typography.Title level={3}>配置分析周期</Typography.Title>
          <Typography.Paragraph type="secondary">
            选择直属员工，依据考勤服务返回的明确状态统计异常频次并生成改进建议。
          </Typography.Paragraph>

          <div className="intelligence-identity-card">
            <span><UserOutlined /></span>
            <div>
              <small>当前分析员工</small>
              <strong>{selectedEmployee?.realName ?? '尚未选择直属员工'}</strong>
              <em>{selectedEmployee?.employeeNo ?? '员工编号未加载'}</em>
            </div>
          </div>

          {Boolean(directReportsError) && (
            <Alert
              className="intelligence-inline-alert"
              type="warning"
              showIcon
              message="直属员工加载失败"
              description={getErrorMessage(directReportsError, '请稍后重试')}
              action={(
                <Button
                  size="small"
                  icon={<ReloadOutlined />}
                  loading={loadingDirectReports}
                  onClick={() => {
                    setAnalysis(null)
                    setAnalysisError(null)
                    void reloadDirectReports()
                  }}
                >
                  重新加载
                </Button>
              )}
            />
          )}

          <label className="intelligence-field-label" htmlFor="attendance-analysis-employee">
            直属员工
          </label>
          <Select<number>
            id="attendance-analysis-employee"
            className="intelligence-wide-control"
            size="large"
            showSearch
            optionFilterProp="label"
            loading={loadingDirectReports}
            value={selectedEmployeeId ?? undefined}
            placeholder="选择直属员工"
            options={directReports.map((employee) => ({
              value: employee.id,
              label: `${employee.realName} · ${employee.employeeNo}`,
            }))}
            notFoundContent={loadingDirectReports ? null : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无直属下属" />
            )}
            onChange={(employeeId) => {
              setPreferredEmployeeId(employeeId)
              setAnalysis(null)
              setAnalysisError(null)
            }}
          />

          {!loadingDirectReports && !directReportsError && directReports.length === 0 && (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="暂无直属下属，当前无法发起考勤分析"
            />
          )}

          <label className="intelligence-field-label" htmlFor="attendance-analysis-month">
            考勤月份
          </label>
          <DatePicker
            id="attendance-analysis-month"
            className="intelligence-wide-control"
            size="large"
            picker="month"
            allowClear={false}
            value={month}
            disabledDate={(current) => current.isAfter(dayjs(), 'month')}
            onChange={(value) => {
              if (value) {
                setMonth(value.startOf('month'))
                setAnalysis(null)
                setAnalysisError(null)
              }
            }}
          />

          {Boolean(analysisError) && (
            <Alert
              className="intelligence-inline-alert"
              type="error"
              showIcon
              message="考勤分析请求失败"
              description={getErrorMessage(analysisError, '请稍后重试')}
            />
          )}

          <div className="intelligence-form-actions">
            <Button
              type="primary"
              size="large"
              icon={<RobotOutlined />}
              loading={analyzing}
              disabled={selectedEmployeeId === null || loadingDirectReports}
              onClick={() => void analyzeAttendance()}
            >
              生成考勤分析
            </Button>
          </div>
        </Card>

      </div>

      <div className="intelligence-output-column">
        {analysis ? (
          <AnalysisResultCard
            title={`${analysis.month} 考勤画像`}
            description={`员工 #${analysis.employeeId} · 月度异常趋势与改善建议`}
            analysisId={analysis.analysisId}
            callStatus={analysis.callStatus}
            disclaimer={analysis.disclaimer}
          >
            <section className="intelligence-risk-banner">
              <div>
                <span>综合风险等级</span>
                <strong>{RISK_LEVEL_LABELS[analysis.riskLevel] ?? analysis.riskLevel}</strong>
              </div>
              <Tag color={RISK_LEVEL_COLORS[analysis.riskLevel] ?? 'default'}>
                {analysis.riskLevel}
              </Tag>
            </section>
            <section className="intelligence-result-section">
              <span>异常概览</span>
              <Typography.Paragraph>{analysis.abnormalSummary}</Typography.Paragraph>
            </section>
            <section className="intelligence-result-section">
              <span>改进建议</span>
              <ul className="intelligence-insight-list">
                {analysis.improvementSuggestions.map((suggestion) => (
                  <li key={suggestion}>{suggestion}</li>
                ))}
              </ul>
            </section>
          </AnalysisResultCard>
        ) : (
          <Card bordered={false} className="intelligence-empty-result">
            <LineChartOutlined />
            <Typography.Title level={3}>等待生成考勤画像</Typography.Title>
            <Typography.Paragraph type="secondary">
              选择月份后发起分析，系统将识别明确的异常状态并给出风险分级。
            </Typography.Paragraph>
          </Card>
        )}
      </div>
    </div>
  )
}
