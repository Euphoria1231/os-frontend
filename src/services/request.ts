import axios, { type AxiosError, type AxiosRequestConfig } from 'axios'
import type {
  ApiResponse,
  HttpClient,
  RequestAuthOptions,
  RequestErrorOptions,
} from './request.types.ts'

const DEFAULT_API_BASE_URL = 'http://localhost:8088'
const DEFAULT_TIMEOUT_MS = 15_000

const requestClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL,
  timeout: DEFAULT_TIMEOUT_MS,
})

let requestAuth: RequestAuthOptions = {
  getAccessToken: () => null,
}

export class RequestError extends Error {
  readonly code?: number
  readonly status?: number

  constructor(message: string, options: RequestErrorOptions = {}) {
    super(message, { cause: options.cause })
    this.name = 'RequestError'
    this.code = options.code
    this.status = options.status
  }
}

export function configureRequestAuth(options: RequestAuthOptions): void {
  requestAuth = options
}

requestClient.interceptors.request.use((config) => {
  const accessToken = requestAuth.getAccessToken()

  if (accessToken) {
    config.headers.set('Authorization', `Bearer ${accessToken}`)
  }

  return config
})

function isApiResponse<T>(value: unknown): value is ApiResponse<T> {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Partial<ApiResponse<T>>
  return typeof candidate.code === 'number' && typeof candidate.message === 'string' && 'data' in candidate
}

function getTransportMessage(error: AxiosError<ApiResponse<unknown>>): string {
  if (!error.response) {
    return '无法连接到服务，请检查网络或后端运行状态'
  }

  if (isApiResponse<unknown>(error.response.data) && error.response.data.message) {
    return error.response.data.message
  }

  return error.message || '请求处理失败，请稍后重试'
}

function toRequestError(error: unknown): RequestError {
  if (!axios.isAxiosError<ApiResponse<unknown>>(error)) {
    return new RequestError('请求处理失败，请稍后重试', { cause: error })
  }

  const status = error.response?.status
  const responseData = error.response?.data

  if (status === 401) {
    requestAuth.onUnauthorized?.()
  }

  return new RequestError(getTransportMessage(error), {
    code: isApiResponse<unknown>(responseData) ? responseData.code : undefined,
    status,
    cause: error,
  })
}

export async function request<T>(config: AxiosRequestConfig): Promise<T> {
  try {
    const response = await requestClient.request<ApiResponse<T>>(config)

    if (!isApiResponse<T>(response.data)) {
      throw new RequestError('服务返回格式不符合约定', { status: response.status })
    }

    if (response.data.code !== 0) {
      throw new RequestError(response.data.message || '业务请求处理失败', {
        code: response.data.code,
        status: response.status,
      })
    }

    return response.data.data
  } catch (error) {
    if (error instanceof RequestError) {
      throw error
    }

    throw toRequestError(error)
  }
}

export const http: HttpClient = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    request<T>({ ...config, method: 'GET', url }),
  post: <T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig) =>
    request<T>({ ...config, method: 'POST', url, data }),
  put: <T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig) =>
    request<T>({ ...config, method: 'PUT', url, data }),
  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    request<T>({ ...config, method: 'DELETE', url }),
}
