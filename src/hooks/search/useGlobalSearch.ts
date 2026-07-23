import { useCallback, useEffect, useRef, useState } from 'react'
import { searchService } from '../../services/search/search.service.ts'
import type {
  ApplicationSearchItem,
  GlobalSearchResult,
  NoticeSearchItem,
  SearchCategory,
} from '../../services/search/search.types.ts'

const SEARCH_DEBOUNCE_MS = 260
const ALL_CATEGORY_PAGE_SIZE = 4
const SINGLE_CATEGORY_PAGE_SIZE = 10

interface SearchState {
  queryKey: string
  results: GlobalSearchResult[]
  loading: boolean
  error: unknown
}

function noticeResult(item: NoticeSearchItem): GlobalSearchResult {
  return { key: `notice-${item.noticeId}`, kind: 'notice', item }
}

function applicationResult(item: ApplicationSearchItem): GlobalSearchResult {
  return { key: `application-${item.applicationId}`, kind: 'application', item }
}

export function useGlobalSearch(keyword: string, category: SearchCategory) {
  const [state, setState] = useState<SearchState>({
    queryKey: '',
    results: [],
    loading: false,
    error: null,
  })
  const [revision, setRevision] = useState(0)
  const requestSequence = useRef(0)
  const normalizedKeyword = keyword.trim()
  const queryKey = normalizedKeyword ? `${category}:${normalizedKeyword}:${revision}` : ''

  useEffect(() => {
    const requestId = ++requestSequence.current
    let active = true

    if (!normalizedKeyword) {
      return () => {
        active = false
      }
    }

    const timer = window.setTimeout(async () => {
      setState({ queryKey, results: [], loading: true, error: null })
      try {
        let nextResults: GlobalSearchResult[]
        if (category === 'all') {
          const [notices, applications] = await Promise.all([
            searchService.searchNotices(normalizedKeyword, ALL_CATEGORY_PAGE_SIZE),
            searchService.searchApplications(normalizedKeyword, ALL_CATEGORY_PAGE_SIZE),
          ])
          nextResults = [
            ...notices.items.map(noticeResult),
            ...applications.items.map(applicationResult),
          ]
        } else if (category === 'notice') {
          const notices = await searchService.searchNotices(
            normalizedKeyword,
            SINGLE_CATEGORY_PAGE_SIZE,
          )
          nextResults = notices.items.map(noticeResult)
        } else {
          const applications = await searchService.searchApplications(
            normalizedKeyword,
            SINGLE_CATEGORY_PAGE_SIZE,
          )
          nextResults = applications.items.map(applicationResult)
        }

        if (active && requestId === requestSequence.current) {
          setState({ queryKey, results: nextResults, loading: false, error: null })
        }
      } catch (requestError) {
        if (active && requestId === requestSequence.current) {
          setState({ queryKey, results: [], loading: false, error: requestError })
        }
      }
    }, SEARCH_DEBOUNCE_MS)

    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [category, normalizedKeyword, queryKey])

  const retry = useCallback(() => {
    setRevision((current) => current + 1)
  }, [])

  if (!normalizedKeyword) {
    return { results: [], loading: false, error: null, retry }
  }
  if (state.queryKey !== queryKey) {
    return { results: [], loading: true, error: null, retry }
  }
  return { results: state.results, loading: state.loading, error: state.error, retry }
}
