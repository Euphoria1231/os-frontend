import { useCallback, useEffect, useState } from 'react'
import { employeeService } from '../../services/employee/employee.service.ts'
import type {
  Employee,
  EmployeeCreateRequest,
  EmployeeUpdateRequest,
} from '../../services/employee/employee.types.ts'

export type EmployeeListScope = 'all' | 'direct-reports'

export function useEmployees(scope: EmployeeListScope = 'all') {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown>(null)

  useEffect(() => {
    let active = true

    const listEmployees = scope === 'direct-reports'
      ? employeeService.listDirectReports
      : employeeService.listEmployees

    listEmployees()
      .then((result) => {
        if (active) {
          setEmployees(result)
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
  }, [scope])

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = scope === 'direct-reports'
        ? await employeeService.listDirectReports()
        : await employeeService.listEmployees()
      setEmployees(result)
    } catch (requestError) {
      setError(requestError)
    } finally {
      setLoading(false)
    }
  }, [scope])

  const createEmployee = useCallback(
    async (values: EmployeeCreateRequest) => {
      const result = await employeeService.createEmployee(values)
      await reload()
      return result
    },
    [reload],
  )

  const updateEmployee = useCallback(
    async (id: number, values: EmployeeUpdateRequest) => {
      const result = await employeeService.updateEmployee(id, values)
      await reload()
      return result
    },
    [reload],
  )

  const deleteEmployee = useCallback(
    async (id: number) => {
      await employeeService.deleteEmployee(id)
      await reload()
    },
    [reload],
  )

  return {
    employees,
    loading,
    error,
    reload,
    createEmployee,
    updateEmployee,
    deleteEmployee,
  }
}
