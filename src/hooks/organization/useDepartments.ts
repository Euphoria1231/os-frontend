import { useCallback, useEffect, useState } from 'react'
import { organizationService } from '../../services/organization/organization.service.ts'
import type {
  Department,
  DepartmentRequest,
} from '../../services/organization/organization.types.ts'

export function useDepartments() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown>(null)

  useEffect(() => {
    let active = true

    organizationService
      .listDepartments()
      .then((result) => {
        if (active) {
          setDepartments(result)
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
      setDepartments(await organizationService.listDepartments())
    } catch (requestError) {
      setError(requestError)
    } finally {
      setLoading(false)
    }
  }, [])

  const createDepartment = useCallback(
    async (values: DepartmentRequest) => {
      const result = await organizationService.createDepartment(values)
      await reload()
      return result
    },
    [reload],
  )

  const updateDepartment = useCallback(
    async (id: number, values: DepartmentRequest) => {
      const result = await organizationService.updateDepartment(id, values)
      await reload()
      return result
    },
    [reload],
  )

  const deleteDepartment = useCallback(
    async (id: number) => {
      await organizationService.deleteDepartment(id)
      await reload()
    },
    [reload],
  )

  return {
    departments,
    loading,
    error,
    reload,
    createDepartment,
    updateDepartment,
    deleteDepartment,
  }
}
