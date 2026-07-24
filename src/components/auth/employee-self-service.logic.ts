const EMPLOYEE_SELF_SERVICE_PATHS = new Set([
  '/attendance',
  '/flow/applications',
])

export function canAccessEmployeeSelfServicePath(
  pathname: string,
  isSuperAdmin: boolean,
): boolean {
  if (!isSuperAdmin) {
    return true
  }

  const normalizedPath = pathname.length > 1
    ? pathname.replace(/\/+$/, '')
    : pathname
  return !EMPLOYEE_SELF_SERVICE_PATHS.has(normalizedPath)
}
