import { useCallback, useEffect, useState } from 'react'
import { flowService } from '../../services/flow/flow.service.ts'
import type {
  ApprovalRequest,
  ApprovalTask,
  FlowApplication,
} from '../../services/flow/flow.types.ts'

export function useApprovalTasks() {
  const [todo, setTodo] = useState<FlowApplication[]>([])
  const [done, setDone] = useState<ApprovalTask[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown>(null)

  useEffect(() => {
    let active = true

    Promise.all([flowService.listTodo(), flowService.listDone()])
      .then(([todoList, doneList]) => {
        if (active) {
          setTodo(todoList)
          setDone(doneList)
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
  }, [])

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [todoList, doneList] = await Promise.all([
        flowService.listTodo(),
        flowService.listDone(),
      ])
      setTodo(todoList)
      setDone(doneList)
    } catch (requestError) {
      setError(requestError)
    } finally {
      setLoading(false)
    }
  }, [])

  const processApplication = useCallback(
    async (applicationId: number, action: 'approve' | 'reject', values: ApprovalRequest) => {
      const result =
        action === 'approve'
          ? await flowService.approve(applicationId, values)
          : await flowService.reject(applicationId, values)
      await reload()
      return result
    },
    [reload],
  )

  return { todo, done, loading, error, reload, processApplication }
}
