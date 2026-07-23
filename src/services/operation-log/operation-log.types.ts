export type OperationLogStatus = 'SUCCESS' | 'FAILURE'

export interface OperationLog {
  id: number
  operatorId: number | null
  operatorName: string
  serviceName: string
  businessModule: string
  operationType: string
  targetType: string | null
  targetId: string | null
  summary: string | null
  operationStatus: OperationLogStatus
  requestPath: string
  httpMethod: string
  clientIp: string | null
  errorMessage: string | null
  operatedAt: string
}

export interface OperationLogPage {
  items: OperationLog[]
  total: number
  page: number
  pageSize: number
}

export interface OperationLogQuery {
  operatorKeyword?: string
  businessModule?: string
  operationStatus?: OperationLogStatus
  startTime?: string
  endTime?: string
  page: number
  pageSize: number
}
