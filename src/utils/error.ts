import { RequestError } from '../services/request.ts'

export function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof RequestError ? error.message : fallback
}
