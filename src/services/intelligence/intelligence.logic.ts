import type {
  AiCallStatus,
  AiStatusMeta,
  OfficeQuestionRequest,
} from './intelligence.types.ts'
import type { FlowApplication } from '../flow/flow.types.ts'

const QUESTION_MAX_LENGTH = 500

const STATUS_META: Record<AiCallStatus, AiStatusMeta> = {
  SUCCESS: {
    label: '分析完成',
    color: 'success',
    description: '模型已完成本次分析',
  },
  DEGRADED: {
    label: '降级结果',
    color: 'warning',
    description: '模型暂不可用，当前展示规则引擎生成的保底结果',
  },
  FAILED: {
    label: '分析失败',
    color: 'error',
    description: '本次分析未生成有效结果，请稍后重试',
  },
}

export function validateOfficeQuestion(question: string): string | null {
  const normalizedQuestion = question.trim()

  if (!normalizedQuestion) {
    return '请输入需要咨询的办公问题'
  }
  if (normalizedQuestion.length > QUESTION_MAX_LENGTH) {
    return `问题不能超过 ${QUESTION_MAX_LENGTH} 个字符`
  }
  return null
}

export function buildOfficeQuestionRequest(question: string): OfficeQuestionRequest {
  return { question: question.trim() }
}

export function getAiStatusMeta(status: AiCallStatus): AiStatusMeta {
  return STATUS_META[status]
}

export function getApprovalCandidates(todoApplications: FlowApplication[]): FlowApplication[] {
  const candidatesById = new Map<number, FlowApplication>()

  for (const application of todoApplications) {
    if (application.applicationType === 'MAKEUP') {
      continue
    }
    if (!candidatesById.has(application.id)) {
      candidatesById.set(application.id, application)
    }
  }

  return [...candidatesById.values()].sort((left, right) =>
    right.createdAt.localeCompare(left.createdAt),
  )
}
