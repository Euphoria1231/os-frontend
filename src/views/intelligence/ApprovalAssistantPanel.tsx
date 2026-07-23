import { useEffect, useMemo, useState } from 'react'
import {
  FileDoneOutlined,
  ReloadOutlined,
  RobotOutlined,
  WarningOutlined,
} from '@ant-design/icons'
import { Alert, App, Button, Card, Empty, Select, Space, Tag, Typography } from 'antd'
import { useAuth } from '../../hooks/auth/useAuth.ts'
import { flowService } from '../../services/flow/flow.service.ts'
import type { FlowApplication } from '../../services/flow/flow.types.ts'
import { mergeApprovalCandidates } from '../../services/intelligence/intelligence.logic.ts'
import { intelligenceService } from '../../services/intelligence/intelligence.service.ts'
import type { ApprovalAnalysisResponse } from '../../services/intelligence/intelligence.types.ts'
import { getErrorMessage } from '../../utils/error.ts'
import { AnalysisResultCard } from './AnalysisResultCard.tsx'

const APPLICATION_TYPE_LABELS: Record<FlowApplication['applicationType'], string> = {
  LEAVE: '请假',
  OVERTIME: '加班',
  MAKEUP: '补签',
}

const APPLICATION_STATUS_LABELS: Record<FlowApplication['status'], string> = {
  PENDING: '待审批',
  APPROVED: '已同意',
  REJECTED: '已驳回',
}

export function ApprovalAssistantPanel() {
  const [applications, setApplications] = useState<FlowApplication[]>([])
  const [selectedApplicationId, setSelectedApplicationId] = useState<number | null>(null)
  const [loadingApplications, setLoadingApplications] = useState(true)
  const [applicationsError, setApplicationsError] = useState<unknown>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisError, setAnalysisError] = useState<unknown>(null)
  const [analysis, setAnalysis] = useState<ApprovalAnalysisResponse | null>(null)
  const { message } = App.useApp()
  const { hasAuthority } = useAuth()
  const canReadTodo = hasAuthority('GET:/api/flow/tasks/**')

  useEffect(() => {
    let active = true

    const todoRequest = canReadTodo ? flowService.listTodo() : Promise.resolve([])
    Promise.all([flowService.listMyApplications(), todoRequest])
      .then(([myApplications, todoApplications]) => {
        if (!active) {
          return
        }
        const candidates = mergeApprovalCandidates(myApplications, todoApplications)
        setApplications(candidates)
        setApplicationsError(null)
        setSelectedApplicationId((current) => (
          current !== null && candidates.some((application) => application.id === current)
            ? current
            : candidates[0]?.id ?? null
        ))
      })
      .catch((error: unknown) => {
        if (active) {
          setApplicationsError(error)
        }
      })
      .finally(() => {
        if (active) {
          setLoadingApplications(false)
        }
      })

    return () => {
      active = false
    }
  }, [canReadTodo, reloadKey])

  const selectedApplication = useMemo(
    () => applications.find((application) => application.id === selectedApplicationId) ?? null,
    [applications, selectedApplicationId],
  )

  const analyzeApplication = async () => {
    if (selectedApplicationId === null) {
      message.warning('请先选择需要分析的申请单')
      return
    }

    setAnalyzing(true)
    setAnalysisError(null)
    try {
      setAnalysis(await intelligenceService.analyzeApproval(selectedApplicationId))
      message.success('审批辅助分析已生成')
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
          <div className="intelligence-card-kicker">
            <FileDoneOutlined />
            APPLICATION REVIEW
          </div>
          <Typography.Title level={3}>选择业务单据</Typography.Title>
          <Typography.Paragraph type="secondary">
            分析范围仅包含你有权查看的请假、加班申请，不读取补签单据。
          </Typography.Paragraph>

          {Boolean(applicationsError) && (
            <Alert
              className="intelligence-inline-alert"
              type="warning"
              showIcon
              message="申请数据加载失败"
              description={getErrorMessage(applicationsError, '请稍后重试')}
            />
          )}

          <label className="intelligence-field-label" htmlFor="approval-analysis-target">
            分析对象
          </label>
          <Select<number>
            id="approval-analysis-target"
            className="intelligence-wide-control"
            size="large"
            loading={loadingApplications}
            value={selectedApplicationId ?? undefined}
            placeholder="选择请假或加班申请"
            optionLabelProp="label"
            options={applications.map((application) => ({
              value: application.id,
              label: `${application.applicationNo} · ${APPLICATION_TYPE_LABELS[application.applicationType]}`,
              title: application.reason,
            }))}
            notFoundContent={loadingApplications ? null : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无可分析申请" />}
            onChange={setSelectedApplicationId}
          />

          {selectedApplication && (
            <div className="intelligence-selection-summary">
              <div>
                <span>业务类型</span>
                <strong>{APPLICATION_TYPE_LABELS[selectedApplication.applicationType]}</strong>
              </div>
              <div>
                <span>当前状态</span>
                <Tag color={selectedApplication.status === 'PENDING' ? 'processing' : 'default'}>
                  {APPLICATION_STATUS_LABELS[selectedApplication.status]}
                </Tag>
              </div>
              <div className="intelligence-selection-reason">
                <span>申请原因</span>
                <strong>{selectedApplication.reason}</strong>
              </div>
            </div>
          )}

          {Boolean(analysisError) && (
            <Alert
              className="intelligence-inline-alert"
              type="error"
              showIcon
              message="审批分析请求失败"
              description={getErrorMessage(analysisError, '请稍后重试')}
            />
          )}

          <Space className="intelligence-form-actions" wrap>
            <Button
              icon={<ReloadOutlined />}
              disabled={analyzing}
              onClick={() => {
                setLoadingApplications(true)
                setApplicationsError(null)
                setReloadKey((value) => value + 1)
              }}
            >
              刷新单据
            </Button>
            <Button
              type="primary"
              size="large"
              icon={<RobotOutlined />}
              loading={analyzing}
              disabled={selectedApplicationId === null || loadingApplications}
              onClick={() => void analyzeApplication()}
            >
              生成辅助意见
            </Button>
          </Space>
        </Card>

        <Alert
          className="intelligence-boundary-note"
          type="info"
          showIcon
          icon={<WarningOutlined />}
          message="AI 不会自动执行审批"
          description="分析结果不会改变申请状态，同意或驳回仍需审批人在审批中心手动操作。"
        />
      </div>

      <div className="intelligence-output-column">
        {analysis ? (
          <AnalysisResultCard
            title="审批辅助判断"
            description={`申请 #${analysis.applicationId} · 由业务数据和 AI Provider 综合生成`}
            analysisId={analysis.analysisId}
            callStatus={analysis.callStatus}
            disclaimer={analysis.disclaimer}
          >
            <section className="intelligence-result-section">
              <span>申请摘要</span>
              <Typography.Paragraph>{analysis.applicationSummary}</Typography.Paragraph>
            </section>
            <section className="intelligence-result-section">
              <span>风险提示</span>
              <ul className="intelligence-insight-list">
                {analysis.riskWarnings.map((warning) => <li key={warning}>{warning}</li>)}
              </ul>
            </section>
            <section className="intelligence-advice-block">
              <span>建议意见</span>
              <Typography.Paragraph>{analysis.suggestedDecision}</Typography.Paragraph>
            </section>
          </AnalysisResultCard>
        ) : (
          <Card bordered={false} className="intelligence-empty-result">
            <RobotOutlined />
            <Typography.Title level={3}>等待生成审批洞察</Typography.Title>
            <Typography.Paragraph type="secondary">
              选择左侧申请单后发起分析，结果将在这里展示，并保留可追溯的分析编号。
            </Typography.Paragraph>
          </Card>
        )}
      </div>
    </div>
  )
}
