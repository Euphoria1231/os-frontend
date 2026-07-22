import type { PageResponse } from './common';

/** 搜索结果类型 */
export type SearchResultType = 'notice' | 'approval';

/** 搜索结果项 */
export interface SearchResultItem {
  id: number;
  type: SearchResultType;
  title: string;
  /** 包含 <em> 高亮标签的摘要片段，前端需安全渲染 */
  snippet: string;
  source: string;
  publishTime: string;
  link: string;
  canAccess: boolean;
}

/** 搜索请求 */
export interface SearchRequest {
  keyword: string;
  pageNum: number;
  pageSize: number;
  type?: SearchResultType | 'all';
}

/** AI 响应状态 */
export type AIStatus = 'success' | 'degraded' | 'failed';

/** AI 问答响应 */
export interface AIAskResponse {
  id: number;
  question: string;
  answer: string;
  status: AIStatus;
  suggestions: string[];
  risks: string[];
}

/** 考勤分析指标 */
export interface AttendanceMetrics {
  attendanceRate: number;
  lateCount: number;
  earlyLeaveCount: number;
  absentCount: number;
  avgWorkHours: number;
}

/** 考勤风险项 */
export interface AttendanceRisk {
  level: 'low' | 'medium' | 'high';
  desc: string;
}

/** 考勤分析响应 */
export interface AttendanceAnalysisResponse {
  summary: string;
  status: AIStatus;
  metrics: AttendanceMetrics;
  risks: AttendanceRisk[];
  suggestions: string[];
}

/** 图表数据点 */
export interface ChartDataPoint {
  name: string;
  value: number;
}

/** 趋势数据点 */
export interface TrendDataPoint {
  date: string;
  [key: string]: string | number;
}

/** 大屏-组织概览 */
export interface DashboardOrganization {
  totalEmployees: number;
  departments: number;
  newThisMonth: number;
  turnoverRate: number;
  deptDistribution: ChartDataPoint[];
  trend: Array<{ month: string; count: number }>;
}

/** 大屏-考勤概览 */
export interface DashboardAttendance {
  todayRate: number;
  lateToday: number;
  absentToday: number;
  onLeave: number;
  trend: Array<{ date: string; present: number; late: number; absent: number }>;
  statusDistribution: ChartDataPoint[];
}

/** 大屏-审批概览 */
export interface DashboardFlow {
  pending: number;
  approved: number;
  rejected: number;
  totalThisMonth: number;
  typeDistribution: ChartDataPoint[];
  trend: Array<{ month: string; approved: number; rejected: number }>;
}

/** 大屏-公告概览 */
export interface DashboardNotice {
  total: number;
  publishedThisMonth: number;
  totalReads: number;
  avgReadRate: number;
  categoryDistribution: ChartDataPoint[];
  trend: Array<{ month: string; count: number; reads: number }>;
}

/** 大屏总览数据 */
export interface DashboardOverview {
  organization: DashboardOrganization;
  attendance: DashboardAttendance;
  flow: DashboardFlow;
  notice: DashboardNotice;
}

/** 搜索结果分页响应 */
export type SearchResponse = PageResponse<SearchResultItem>;
