import { useState } from 'react'
import {
  BookOutlined,
  ClearOutlined,
  MessageOutlined,
  RobotOutlined,
  SendOutlined,
} from '@ant-design/icons'
import { Alert, App, Button, Card, Space, Typography } from 'antd'
import { validateOfficeQuestion } from '../../services/intelligence/intelligence.logic.ts'
import { intelligenceService } from '../../services/intelligence/intelligence.service.ts'
import type { OfficeQuestionResponse } from '../../services/intelligence/intelligence.types.ts'
import { getErrorMessage } from '../../utils/error.ts'
import { AnalysisResultCard } from './AnalysisResultCard.tsx'

const QUICK_QUESTIONS = [
  '上下班考勤和迟到如何判定？',
  '请假申请需要经过什么审批流程？',
  '加班申请提交时需要填写哪些信息？',
]

export function OfficeQuestionPanel() {
  const [question, setQuestion] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)
  const [asking, setAsking] = useState(false)
  const [requestError, setRequestError] = useState<unknown>(null)
  const [response, setResponse] = useState<OfficeQuestionResponse | null>(null)
  const { message } = App.useApp()

  const askQuestion = async () => {
    const errorMessage = validateOfficeQuestion(question)
    setValidationError(errorMessage)
    if (errorMessage) {
      return
    }

    setAsking(true)
    setRequestError(null)
    try {
      setResponse(await intelligenceService.askOfficeQuestion(question))
      message.success('智能答复已生成')
    } catch (error) {
      setRequestError(error)
    } finally {
      setAsking(false)
    }
  }

  const clearQuestion = () => {
    setQuestion('')
    setValidationError(null)
    setRequestError(null)
  }

  return (
    <div className="intelligence-workspace">
      <div className="intelligence-control-column">
        <Card bordered={false} className="intelligence-control-card intelligence-question-card">
          <Typography.Title level={3}>向办公助手提问</Typography.Title>
          <textarea
            id="office-question-input"
            className={`intelligence-question-input${validationError ? ' has-error' : ''}`}
            rows={7}
            maxLength={500}
            value={question}
            placeholder="例如：如果忘记下班打卡，应该如何处理？"
            disabled={asking}
            onChange={(event) => {
              setQuestion(event.target.value)
              if (validationError) {
                setValidationError(validateOfficeQuestion(event.target.value))
              }
            }}
          />
          <div className="intelligence-question-meta">
            <span className={validationError ? 'is-error' : ''}>
              {validationError ?? '请勿输入密码、Token 或其他敏感信息'}
            </span>
            <span>{question.length} / 500</span>
          </div>

          <div className="intelligence-quick-questions">
            <span>常用问题</span>
            <Space wrap size={[8, 8]}>
              {QUICK_QUESTIONS.map((quickQuestion) => (
                <Button
                  key={quickQuestion}
                  size="small"
                  disabled={asking}
                  onClick={() => {
                    setQuestion(quickQuestion)
                    setValidationError(null)
                  }}
                >
                  {quickQuestion}
                </Button>
              ))}
            </Space>
          </div>

          {Boolean(requestError) && (
            <Alert
              className="intelligence-inline-alert"
              type="error"
              showIcon
              message="办公问答请求失败"
              description={getErrorMessage(requestError, '请稍后重试')}
            />
          )}

          <Space className="intelligence-form-actions" wrap>
            <Button icon={<ClearOutlined />} disabled={asking || !question} onClick={clearQuestion}>
              清空
            </Button>
            <Button
              type="primary"
              size="large"
              icon={<SendOutlined />}
              loading={asking}
              disabled={!question.trim()}
              onClick={() => void askQuestion()}
            >
              发送问题
            </Button>
          </Space>
        </Card>

      </div>

      <div className="intelligence-output-column">
        {response ? (
          <AnalysisResultCard
            title="智能办公答复"
            description="根据当前问题生成的辅助说明"
            analysisId={response.analysisId}
            callStatus={response.callStatus}
            disclaimer={response.disclaimer}
          >
            <section className="intelligence-answer-block">
              <span><RobotOutlined /></span>
              <Typography.Paragraph>{response.answer}</Typography.Paragraph>
            </section>
          </AnalysisResultCard>
        ) : (
          <Card bordered={false} className="intelligence-empty-result">
            <MessageOutlined />
            <Typography.Title level={3}>等待你的办公问题</Typography.Title>
            <Typography.Paragraph type="secondary">
              左侧输入问题或选择常用问题，答复将在这里展示，并标注模型调用状态和审计编号。
            </Typography.Paragraph>
          </Card>
        )}
      </div>
    </div>
  )
}
