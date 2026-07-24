import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { Platform } from 'react-native';
import { store } from '../../store/store';
import {
  refreshToken,
  logoutUser,
} from '../../store/auth_store/action/auth.thunks';
import {
  PASSWORD_RESET_CONFIRM,
  PASSWORD_RESET_REQUEST,
  REFRESH_TOKEN,
  SIGNIN,
  SIGNUP,
} from '../../constants/apiServiceEndpoint';
import { logout } from '../../store/auth_store/reducer/auth.reducer';
import { API_URL } from '../../utils/utils';

let baseURL = API_URL;
const apiClient: AxiosInstance = axios.create({
  baseURL,
  timeout: 13000,
  headers: {
    'Content-Type': 'application/json',
    'App-Version': '1.0',
    platform: Platform.OS === 'android' ? '1' : '2',
  },
});

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const publicRoutes = [
      SIGNIN,
      SIGNUP,
      PASSWORD_RESET_REQUEST,
      PASSWORD_RESET_CONFIRM,
    ];
    const isPublicRoute = publicRoutes.some(route =>
      config.url?.includes(route),
    );
    if (isPublicRoute) {
      return config;
    }
    let token = store.getState().auth?.tokens?.accessToken;
    if (config.url?.includes(REFRESH_TOKEN)) {
      token = store.getState().auth?.tokens?.refreshToken;
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: any) => {
    const originalRequest = error.config;
    if (originalRequest?.url?.includes(REFRESH_TOKEN)) {
      store.dispatch(logout());
      return Promise.reject(error);
    }
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshTokenValue = store.getState().auth?.tokens?.refreshToken;
        if (!refreshTokenValue) {
          store.dispatch(logout());
          return Promise.reject(error);
        }
        const result = await store.dispatch(refreshToken());
        if (refreshToken.fulfilled.match(result)) {
          const accessToken = store.getState().auth?.tokens?.accessToken;
          if (accessToken) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return apiClient(originalRequest);
          }
        }
        store.dispatch(logout());
      } catch (err) {
        store.dispatch(logout());
      }
    }
    return Promise.reject(error);
  },
);

export const get = async <T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> => {
  const response = await apiClient.get<T>(url, config);
  return response.data;
};

export const post = async <T, D = any>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig,
): Promise<T> => {
  const response = await apiClient.post<T>(url, data, config);
  return response.data;
};

export const put = async <T, D = any>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig,
): Promise<T> => {
  const response = await apiClient.put<T>(url, data, config);
  return response.data;
};

export const patch = async <T, D = any>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig,
): Promise<T> => {
  const response = await apiClient.patch<T>(url, data, config);
  return response.data;
};

export const del = async <T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> => {
  const response = await apiClient.delete<T>(url, config);
  return response.data;
};

export const setBaseURL = (url: string) => {
  baseURL = url;
  apiClient.defaults.baseURL = url;
};

export const getBaseURL = () => baseURL;

export default apiClient;
