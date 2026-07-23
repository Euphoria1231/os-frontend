import { useCallback, useEffect, useState } from 'react'
import { organizationService } from '../../services/organization/organization.service.ts'
import type {
  Position,
  PositionRequest,
} from '../../services/organization/organization.types.ts'

export function usePositions() {
  const [positions, setPositions] = useState<Position[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown>(null)

  useEffect(() => {
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
  }, [])

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setPositions(await organizationService.listPositions())
    } catch (requestError) {
      setError(requestError)
    } finally {
      setLoading(false)
    }
  }, [])

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
    positions,
    loading,
    error,
    reload,
    createPosition,
    updatePosition,
    deletePosition,
  }
}
