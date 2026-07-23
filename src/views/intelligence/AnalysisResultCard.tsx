import { useState, type ReactNode } from 'react'
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileSearchOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons'
import {
  Alert,
  Button,
  Card,
  Descriptions,
  Modal,
  Skeleton,
  Space,
  Tag,
  Typography,
} from 'antd'
import { getAiStatusMeta } from '../../services/intelligence/intelligence.logic.ts'
import { intelligenceService } from '../../services/intelligence/intelligence.service.ts'
import type {
  AiAnalysisRecordResponse,
  AiCallStatus,
} from '../../services/intelligence/intelligence.types.ts'
import { formatDateTime } from '../../utils/date.ts'
import { getErrorMessage } from '../../utils/error.ts'

interface AnalysisResultCardProps {
  title: string
  description: string
  analysisId: number | null
  callStatus: AiCallStatus
  disclaimer: string
  children: ReactNode
}

export function AnalysisResultCard({
  title,
  description,
  analysisId,
  callStatus,
  disclaimer,
  children,
}: AnalysisResultCardProps) {
  const [auditOpen, setAuditOpen] = useState(false)
  const [auditLoading, setAuditLoading] = useState(false)
  const [auditRecord, setAuditRecord] = useState<AiAnalysisRecordResponse | null>(null)
  const [auditError, setAuditError] = useState<unknown>(null)
  const statusMeta = getAiStatusMeta(callStatus)

  const openAuditRecord = async () => {
    if (analysisId === null) {
      return
    }

    setAuditOpen(true)
    if (auditRecord?.id === analysisId) {
      return
    }

    setAuditLoading(true)
    setAuditError(null)
    try {
      setAuditRecord(await intelligenceService.getAnalysis(analysisId))
    } catch (error) {
      setAuditError(error)
    } finally {
      setAuditLoading(false)
    }
  }

  return (
    <>
      <Card
        bordered={false}
        className={`intelligence-result-card intelligence-result-${callStatus.toLowerCase()}`}
      >
        <div className="intelligence-result-heading">
          <div>
            <Space size={8} wrap>
              <Typography.Title level={4}>{title}</Typography.Title>
              <Tag color={statusMeta.color} icon={<CheckCircleOutlined />}>
                {statusMeta.label}
              </Tag>
            </Space>
            <Typography.Paragraph type="secondary">{description}</Typography.Paragraph>
          </div>
          <Button
            type="text"
            icon={<FileSearchOutlined />}
            disabled={analysisId === null}
            onClick={() => void openAuditRecord()}
          >
            {analysisId === null ? '暂无审计记录' : `查看审计 #${analysisId}`}
          </Button>
        </div>

        <Alert
          className="intelligence-status-alert"
          type={callStatus === 'FAILED' ? 'error' : callStatus === 'DEGRADED' ? 'warning' : 'success'}
          showIcon
          message={statusMeta.description}
        />

        <div className="intelligence-result-body">{children}</div>

        <div className="intelligence-disclaimer">
          <SafetyCertificateOutlined />
          <span>{disclaimer || 'AI 输出仅供参考，请结合公司制度和业务材料人工判断。'}</span>
        </div>
      </Card>

      <Modal
        title="AI 分析审计详情"
        open={auditOpen}
        width={680}
        footer={null}
        onCancel={() => setAuditOpen(false)}
      >
        {auditLoading ? (
          <Skeleton active paragraph={{ rows: 5 }} />
        ) : auditError ? (
          <Alert
            type="error"
            showIcon
            message="审计记录加载失败"
            description={getErrorMessage(auditError, '请稍后重试')}
            action={<Button size="small" onClick={() => void openAuditRecord()}>重试</Button>}
          />
        ) : auditRecord ? (
          <Descriptions
            bordered
            size="small"
            column={2}
            items={[
              { key: 'id', label: '分析编号', children: `#${auditRecord.id}` },
              { key: 'status', label: '调用状态', children: <Tag>{auditRecord.status}</Tag> },
              { key: 'type', label: '请求类型', children: auditRecord.requestType },
              { key: 'reference', label: '业务标识', children: auditRecord.businessReferenceId },
              {
                key: 'employee',
                label: '发起员工',
                children: auditRecord.initiatorEmployeeId ?? '系统任务',
              },
              {
                key: 'duration',
                label: '处理耗时',
                children: (
                  <Space size={6}>
                    <ClockCircleOutlined />
                    {auditRecord.durationMs} ms
                  </Space>
                ),
              },
              {
                key: 'auditedAt',
                label: '审计时间',
                span: 2,
                children: formatDateTime(auditRecord.auditedAt),
              },
              {
                key: 'summary',
                label: '结果摘要',
                span: 2,
                children: auditRecord.resultSummary,
              },
            ]}
          />
        ) : null}
      </Modal>
    </>
  )
}
