export interface LoginRequest {
  username: string
  password: string
}

export interface CurrentUser {
  id: string
  username: string
  displayName: string
  avatarUrl?: string
}

export interface UserMenu {
  id: string
  title: string
  path: string
  icon?: string
  parentId?: string
  orderNo?: number
}

export interface AuthProfile {
  currentUser: CurrentUser
  menus: UserMenu[]
  permissionCodes: string[]
}

export interface LoginResponse extends AuthProfile {
  token: string
}
