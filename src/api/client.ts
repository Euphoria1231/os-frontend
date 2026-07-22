import axios, { type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { message } from 'antd';
import type { ApiResponse } from '../types/common';
import { SUCCESS_CODE, BUSINESS_ERROR_CODES } from '../types/common';

const TOKEN_KEY = 'oa_token';

const client = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

client.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const { data } = response;

    // Blob 响应（文件下载）直接返回，不走业务码校验
    if (data instanceof Blob) {
      return data;
    }

    if (data.code === SUCCESS_CODE) {
      return data;
    }

    message.error(data.message || '业务异常');
    return Promise.reject(new Error(data.message || '业务异常'));
  },
  (error) => {
    if (error.response) {
      const { status } = error.response;
      const respData = error.response.data as ApiResponse | undefined;

      if (status === BUSINESS_ERROR_CODES.UNAUTHORIZED) {
        localStorage.removeItem(TOKEN_KEY);
        message.error('登录已过期，请重新登录');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      if (status === BUSINESS_ERROR_CODES.FORBIDDEN) {
        message.error('没有权限执行此操作');
        return Promise.reject(error);
      }

      const errMsg = respData?.message || error.message || '请求失败';
      message.error(errMsg);
    } else if (error.code === 'ECONNABORTED') {
      message.error('请求超时，请稍后重试');
    } else {
      message.error('网络异常，请检查网络连接');
    }

    return Promise.reject(error);
  },
);

export { client, TOKEN_KEY };
export default client;
