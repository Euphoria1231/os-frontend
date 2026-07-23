import { useCallback, useEffect, useState } from 'react'
import { organizationService } from '../../services/organization/organization.service.ts'
import type {
  Position,
  PositionRequest,
} from '../../services/organization/organization.types.ts'

export function usePositions(enabled = true) {
  const [positions, setPositions] = useState<Position[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown>(null)

  useEffect(() => {
    if (!enabled) {
      return
    }

    let active = true

    organizationService
      .listPositions()
      .then((result) => {
        if (active) {
          setPositions(result)
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
      setPositions(await organizationService.listPositions())
    } catch (requestError) {
      setError(requestError)
    } finally {
      setLoading(false)
    }
  }, [enabled])

  const createPosition = useCallback(
    async (values: PositionRequest) => {
      const result = await organizationService.createPosition(values)
      await reload()
      return result
    },
    [reload],
  )

  const updatePosition = useCallback(
    async (id: number, values: PositionRequest) => {
      const result = await organizationService.updatePosition(id, values)
      await reload()
      return result
    },
    [reload],
  )

  const deletePosition = useCallback(
    async (id: number) => {
      await organizationService.deletePosition(id)
      await reload()
    },
    [reload],
  )

  return {
    positions: enabled ? positions : [],
    loading: enabled ? loading : false,
    error: enabled ? error : null,
    reload,
    createPosition,
    updatePosition,
    deletePosition,
  }
}
