import client from '../client';
import type { ApiResponse } from '../../types/common';
import type {
  SearchRequest,
  SearchResponse,
  AIAskResponse,
  AttendanceAnalysisResponse,
  DashboardOverview,
} from '../../types/intelligence';

/** 全文检索 */
export function search(req: SearchRequest): Promise<ApiResponse<SearchResponse>> {
  return client.post('/intelligence/search', req);
}

/** AI 问答 */
export function askAI(question: string): Promise<ApiResponse<AIAskResponse>> {
  return client.post('/intelligence/ai/ask', { question });
}

/** 考勤智能分析 */
export function getAttendanceAnalysis(): Promise<ApiResponse<AttendanceAnalysisResponse>> {
  return client.post('/intelligence/ai/attendance-analysis');
}

/** 获取大屏总览数据 */
export function getDashboardOverview(): Promise<ApiResponse<DashboardOverview>> {
  return client.get('/intelligence/dashboard/overview');
}
