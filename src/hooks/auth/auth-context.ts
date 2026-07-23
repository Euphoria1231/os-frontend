import { createContext } from 'react'
import type { AuthContextValue } from './auth-context.types.ts'

export const AuthContext = createContext<AuthContextValue | null>(null)
