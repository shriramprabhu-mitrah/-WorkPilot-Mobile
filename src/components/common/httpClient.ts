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
import { API_URL, showSuccessToast } from '../../utils/utils';
import reactotron from '../../config/ReactotronConfig';
import { setNetworkError } from '../../store/commonSlice';

let baseURL = API_URL;
const apiClient: AxiosInstance = axios.create({
  baseURL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
    'App-Version': '1.0',
    platform: Platform.OS === 'android' ? '1' : '2',
    'X-Client-Platform': 'mobile',
  },
});

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const accessToken = store.getState().auth?.tokens?.accessToken;

    const publicRoutes = [
      SIGNIN,
      SIGNUP,
      PASSWORD_RESET_REQUEST,
      PASSWORD_RESET_CONFIRM,
    ];

    const isPublicRoute = publicRoutes.some(route =>
      config.url?.includes(route),
    );

    config.headers['X-Client-Platform'] = 'mobile';

    if (!isPublicRoute && accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    console.log('[API REQUEST]', {
      url: config.url,
      method: config.method,
      isPublicRoute,
      hasAccessToken: !!accessToken,
      hasAuthorization: !!config.headers.Authorization,
    });

    return config;
  },
  error => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    store.dispatch(setNetworkError(false));

    reactotron.display({
      name: 'API Response',
      value: {
        method: response.config.method?.toUpperCase(),
        url: `${response.config.baseURL}${response.config.url}`,
        status: response.status,
        data: response.data,
      },
    });

    return response;
  },

  async error => {
    const originalRequest = error.config;

    reactotron.display({
      name: 'API Error',
      value: {
        method: originalRequest?.method?.toUpperCase(),
        url: `${originalRequest?.baseURL || ''}${originalRequest?.url || ''}`,
        status: error.response?.status,
        code: error.code,
        message: error.message,
        data: error.response?.data,
      },
    });

    // Network errors
    if (
      error.code === 'ERR_NETWORK' ||
      error.code === 'ECONNABORTED' ||
      error.message === 'Network Error' ||
      !error.response
    ) {
      store.dispatch(setNetworkError(true));
      return Promise.reject(error);
    }

    store.dispatch(setNetworkError(false));

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Access token is invalid/expired
    if (error.response?.status === 401) {
      console.log('[AUTH] Access token rejected');

      store.dispatch(logout());

      showSuccessToast(
        'Your session has expired. Please login again.',
        'error',
      );

      return Promise.reject(error);
    }

    // Other API errors
    showSuccessToast(
      error.response?.data?.message ||
        error.response?.data?.error?.message ||
        error.message ||
        'Something went wrong',
      'error',
    );

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
