import { useCallback, useEffect, useState } from 'react'
import { employeeService } from '../../services/employee/employee.service.ts'
import type {
  Employee,
  EmployeeCreateRequest,
  EmployeeUpdateRequest,
} from '../../services/employee/employee.types.ts'

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown>(null)

  useEffect(() => {
    let active = true

    employeeService
      .listEmployees()
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
  }, [])

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setEmployees(await employeeService.listEmployees())
    } catch (requestError) {
      setError(requestError)
    } finally {
      setLoading(false)
    }
  }, [])

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
