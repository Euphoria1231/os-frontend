import { useCallback, useEffect, useState } from 'react'
import { flowService } from '../../services/flow/flow.service.ts'
import type {
  ApplicationRequest,
  ApplicationType,
  FlowApplication,
  MakeupApplicationRequest,
} from '../../services/flow/flow.types.ts'

export function useApplications(enabled = true) {
  const [applications, setApplications] = useState<FlowApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown>(null)

  useEffect(() => {
    if (!enabled) {
      return
    }

    let active = true

    flowService
      .listMyApplications()
      .then((result) => {
        if (active) {
          setApplications(result)
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
  }, [enabled])

  const reload = useCallback(async () => {
    if (!enabled) {
      return
    }

    setLoading(true)
    setError(null)
    try {
      setApplications(await flowService.listMyApplications())
    } catch (requestError) {
      setError(requestError)
    } finally {
      setLoading(false)
    }
  }, [enabled])

  const submitApplication = useCallback(
    async (type: Exclude<ApplicationType, 'MAKEUP'>, values: ApplicationRequest) => {
      const result =
        type === 'LEAVE'
          ? await flowService.submitLeave(values)
          : await flowService.submitOvertime(values)
      await reload()
      return result
    },
    [reload],
  )

  const submitMakeup = useCallback(
    async (values: MakeupApplicationRequest) => {
      const result = await flowService.submitMakeup(values)
      await reload()
      return result
    },
    [reload],
  )

  return {
    applications: enabled ? applications : [],
    loading: enabled ? loading : false,
    error: enabled ? error : null,
    reload,
    submitApplication,
    submitMakeup,
  }
}
