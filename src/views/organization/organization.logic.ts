export interface OrganizationSelectOption {
  label: string
  value: number
}

export interface PositionCandidate {
  id: number
  departmentId: number
  code: string
  name: string
  status: 0 | 1
}

export interface EmployeeCandidate {
  id: number
  departmentId: number
  employeeNo: string
  realName: string
  status: 0 | 1
}

export interface DepartmentChangeFields {
  departmentId: number
  positionId: number | undefined
  leaderId: number | null
}

export function getDepartmentChangeFields(
  departmentId: number,
): DepartmentChangeFields {
  return {
    departmentId,
    positionId: undefined,
    leaderId: null,
  }
}

export function getDepartmentPositionOptions(
  positions: PositionCandidate[],
  departmentId?: number,
): OrganizationSelectOption[] {
  if (departmentId === undefined) {
    return []
  }

  return positions
    .filter((position) => (
      position.departmentId === departmentId && position.status === 1
    ))
    .map((position) => ({
      label: `${position.name} · ${position.code}`,
      value: position.id,
    }))
}

export function getDepartmentEmployeeOptions(
  employees: EmployeeCandidate[],
  departmentId?: number,
  excludedEmployeeId?: number,
): OrganizationSelectOption[] {
  if (departmentId === undefined) {
    return []
  }

  return employees
    .filter((employee) => (
      employee.departmentId === departmentId
      && employee.status === 1
      && employee.id !== excludedEmployeeId
    ))
    .map((employee) => ({
      label: `${employee.realName} · ${employee.employeeNo}`,
      value: employee.id,
    }))
}
