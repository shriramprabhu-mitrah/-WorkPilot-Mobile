import { BaseQueryFn } from '@reduxjs/toolkit/query';
import apiClient from '../../components/common/httpClient';
import { AxiosError, AxiosRequestConfig } from 'axios';

export interface AxiosBaseQueryArgs {
  url: string;
  method?: AxiosRequestConfig['method'];
  data?: any;
  params?: Record<string, any>;
}

/**
 * A custom baseQuery that wraps the existing Axios httpClient instance.
 *
 * This ensures all RTK Query requests flow through the same interceptors
 * (auth token injection, 401 handling, Reactotron logging, network-error
 * detection) that the rest of the app already relies on.
 */
const axiosBaseQuery: BaseQueryFn<
  AxiosBaseQueryArgs,
  unknown,
  unknown
> = async ({ url, method = 'GET', data, params }) => {
  try {
    const response = await apiClient({ url, method, data, params });
    return { data: response.data };
  } catch (error) {
    const axiosError = error as AxiosError;
    return {
      error: {
        status: axiosError.response?.status,
        data: axiosError.response?.data || axiosError.message,
      },
    };
  }
};

export default axiosBaseQuery;
