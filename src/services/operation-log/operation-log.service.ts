import { http } from '../request.ts'
import type { OperationLogPage, OperationLogQuery } from './operation-log.types.ts'

const OPERATION_LOG_PATH = '/api/user/operation-logs'

function commonParams(query: OperationLogQuery) {
  return {
    businessModule: query.businessModule,
    operationStatus: query.operationStatus,
    startTime: query.startTime,
    endTime: query.endTime,
    page: query.page,
    pageSize: query.pageSize,
  }
}

export const operationLogService = {
  list: (query: OperationLogQuery, viewAll: boolean) =>
    http.get<OperationLogPage>(viewAll ? OPERATION_LOG_PATH : `${OPERATION_LOG_PATH}/mine`, {
      params: viewAll
        ? { ...commonParams(query), operatorKeyword: query.operatorKeyword }
        : commonParams(query),
    }),
}
