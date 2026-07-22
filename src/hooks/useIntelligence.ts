import { useState, useCallback } from 'react';
import * as intelligenceApi from '../api/intelligence';
import type {
  SearchRequest,
  SearchResultItem,
  AIAskResponse,
  AttendanceAnalysisResponse,
  DashboardOverview,
} from '../types/intelligence';
import type { PageResponse } from '../types/common';

/** 全文检索 */
export function useSearch() {
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searched, setSearched] = useState(false);

  const search = useCallback(async (keyword: string, type?: SearchRequest['type']) => {
    if (!keyword.trim()) {
      setResults([]);
      setTotal(0);
      setSearched(true);
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const res = await intelligenceApi.search({ keyword, pageNum, pageSize, type });
      const page = res.data as PageResponse<SearchResultItem>;
      setResults(page.list);
      setTotal(page.total);
    } catch {
      setResults([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [pageNum, pageSize]);

  return {
    results,
    total,
    loading,
    pageNum,
    pageSize,
    searched,
    setPageNum,
    setPageSize,
    search,
  };
}

/** AI 问答 */
export function useAIAsk() {
  const [loading, setLoading] = useState(false);

  const ask = useCallback(async (question: string): Promise<AIAskResponse | null> => {
    if (!question.trim()) return null;
    setLoading(true);
    try {
      const res = await intelligenceApi.askAI(question);
      return res.data;
    } catch {
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, ask };
}

/** 考勤智能分析 */
export function useAttendanceAnalysis() {
  const [analysis, setAnalysis] = useState<AttendanceAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchAnalysis = useCallback(async () => {
    setLoading(true);
    try {
      const res = await intelligenceApi.getAttendanceAnalysis();
      setAnalysis(res.data);
    } catch {
      setAnalysis(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return { analysis, loading, fetchAnalysis };
}

/** 大屏总览 */
export function useDashboardOverview() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    try {
      const res = await intelligenceApi.getDashboardOverview();
      setOverview(res.data);
    } catch {
      setOverview(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return { overview, loading, fetchOverview };
}
