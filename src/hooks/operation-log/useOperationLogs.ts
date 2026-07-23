import { useCallback, useEffect, useState } from 'react'
import { operationLogService } from '../../services/operation-log/operation-log.service.ts'
import type {
  OperationLog,
  OperationLogQuery,
} from '../../services/operation-log/operation-log.types.ts'

const INITIAL_QUERY: OperationLogQuery = {
  page: 1,
  pageSize: 20,
}

export function useOperationLogs(viewAll: boolean) {
  const [logs, setLogs] = useState<OperationLog[]>([])
  const [total, setTotal] = useState(0)
  const [query, setQuery] = useState<OperationLogQuery>(INITIAL_QUERY)
  const [reloadVersion, setReloadVersion] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown>(null)

  useEffect(() => {
    let active = true

    operationLogService
      .list(query, viewAll)
      .then((page) => {
        if (active) {
          setLogs(page.items)
          setTotal(page.total)
          setError(null)
        }
      })
      .catch((requestError: unknown) => {
        if (active) {
          setError(requestError)
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [query, reloadVersion, viewAll])

  const applyQuery = useCallback((nextQuery: OperationLogQuery) => {
    setLoading(true)
    setQuery(nextQuery)
  }, [])

  const reload = useCallback(() => {
    setLoading(true)
    setReloadVersion((version) => version + 1)
  }, [])

  return { logs, total, query, loading, error, applyQuery, reload }
}
