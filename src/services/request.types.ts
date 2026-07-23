import type { AxiosRequestConfig } from 'axios'

export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export interface RequestAuthOptions {
  getAccessToken: () => string | null
  onUnauthorized?: () => void
}

export interface RequestErrorOptions {
  code?: number
  status?: number
  cause?: unknown
}

export interface HttpClient {
  get: <T>(url: string, config?: AxiosRequestConfig) => Promise<T>
  post: <T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig) => Promise<T>
  put: <T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig) => Promise<T>
  delete: <T>(url: string, config?: AxiosRequestConfig) => Promise<T>
}
