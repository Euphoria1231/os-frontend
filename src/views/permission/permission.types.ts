import type { useRbacData } from '../../hooks/rbac/useRbacData.ts'

export type RbacDataController = ReturnType<typeof useRbacData>

export interface PermissionPanelProps {
  controller: RbacDataController
}
