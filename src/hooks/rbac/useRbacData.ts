import { useCallback, useEffect, useState } from 'react'
import { rbacService } from '../../services/rbac/rbac.service.ts'
import type {
  ApiPermission,
  ApiPermissionRequest,
  MenuPermission,
  MenuPermissionRequest,
  Role,
  RoleGrantRequest,
  RoleRequest,
} from '../../services/rbac/rbac.types.ts'

export function useRbacData() {
  const [roles, setRoles] = useState<Role[]>([])
  const [menus, setMenus] = useState<MenuPermission[]>([])
  const [apiPermissions, setApiPermissions] = useState<ApiPermission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown>(null)

  useEffect(() => {
    let active = true

    Promise.all([
      rbacService.listRoles(),
      rbacService.listMenus(),
      rbacService.listApiPermissions(),
    ])
      .then(([roleList, menuList, permissionList]) => {
        if (active) {
          setRoles(roleList)
          setMenus(menuList)
          setApiPermissions(permissionList)
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
      const [roleList, menuList, permissionList] = await Promise.all([
        rbacService.listRoles(),
        rbacService.listMenus(),
        rbacService.listApiPermissions(),
      ])
      setRoles(roleList)
      setMenus(menuList)
      setApiPermissions(permissionList)
    } catch (requestError) {
      setError(requestError)
    } finally {
      setLoading(false)
    }
  }, [])

  const createRole = useCallback(async (values: RoleRequest) => {
    const result = await rbacService.createRole(values)
    await reload()
    return result
  }, [reload])

  const updateRole = useCallback(async (id: number, values: RoleRequest) => {
    const result = await rbacService.updateRole(id, values)
    await reload()
    return result
  }, [reload])

  const deleteRole = useCallback(async (id: number) => {
    await rbacService.deleteRole(id)
    await reload()
  }, [reload])

  const assignRolePermissions = useCallback(async (id: number, values: RoleGrantRequest) => {
    await rbacService.assignRolePermissions(id, values)
  }, [])

  const createMenu = useCallback(async (values: MenuPermissionRequest) => {
    const result = await rbacService.createMenu(values)
    await reload()
    return result
  }, [reload])

  const updateMenu = useCallback(async (id: number, values: MenuPermissionRequest) => {
    const result = await rbacService.updateMenu(id, values)
    await reload()
    return result
  }, [reload])

  const deleteMenu = useCallback(async (id: number) => {
    await rbacService.deleteMenu(id)
    await reload()
  }, [reload])

  const createApiPermission = useCallback(async (values: ApiPermissionRequest) => {
    const result = await rbacService.createApiPermission(values)
    await reload()
    return result
  }, [reload])

  const updateApiPermission = useCallback(async (id: number, values: ApiPermissionRequest) => {
    const result = await rbacService.updateApiPermission(id, values)
    await reload()
    return result
  }, [reload])

  const deleteApiPermission = useCallback(async (id: number) => {
    await rbacService.deleteApiPermission(id)
    await reload()
  }, [reload])

  return {
    roles,
    menus,
    apiPermissions,
    loading,
    error,
    reload,
    createRole,
    updateRole,
    deleteRole,
    assignRolePermissions,
    createMenu,
    updateMenu,
    deleteMenu,
    createApiPermission,
    updateApiPermission,
    deleteApiPermission,
  }
}
