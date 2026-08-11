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
  },
});

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const accessToken = store.getState().auth?.tokens?.accessToken;

    const authState = store.getState().auth;

    console.log('========== AUTH DEBUG ==========');
    console.log('accessToken:', authState?.tokens?.accessToken);
    console.log('refreshToken:', authState?.tokens?.refreshToken);
    console.log('isAuthenticated:', authState?.isAuthenticated);
    console.log('URL:', config.url);
    console.log('================================');

    const publicRoutes = [
      SIGNIN,
      SIGNUP,
      PASSWORD_RESET_REQUEST,
      PASSWORD_RESET_CONFIRM,
      REFRESH_TOKEN,
    ];

    const isPublicRoute = publicRoutes.some(route =>
      config.url?.includes(route),
    );

    if (config.url?.includes(REFRESH_TOKEN)) {
      const refreshTokenValue = store.getState().auth?.tokens?.refreshToken;

      if (refreshTokenValue) {
        config.headers.Authorization = `Bearer ${refreshTokenValue}`;
      }
    } else if (!isPublicRoute && accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    reactotron.display({
      name: '🚀 API REQUEST',
      value: {
        method: config.method?.toUpperCase(),
        url: `${config.baseURL}${config.url}`,
        headers: config.headers,
        body: config.data,
        hasAccessToken: !!accessToken,
      },
    });

    return config;
  },
  error => {
    reactotron.display({
      name: '❌ REQUEST CONFIG ERROR',
      value: {
        message: error?.message,
        error,
      },
    });

    return Promise.reject(error);
  },
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

    // const method = response.config.method?.toLowerCase();

    // console.log('LINE103', response?.data?.message);

    // if (
    //   ['post', 'put', 'patch', 'delete'].includes(method || '') &&
    //   response?.data?.message
    // ) {
    //   showSuccessToast(response?.data?.message, 'success');
    // }

    return response;
  },
  async error => {
    reactotron.display({
      name: 'API Error',
      value: {
        method: error.config?.method?.toUpperCase(),
        url: `${error.config?.baseURL || ''}${error.config?.url || ''}`,
        status: error.response?.status,
        code: error.code,
        message: error.message,
        data: error.response?.data,
      },
    });

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

    const originalRequest = error.config;

    if (!originalRequest) {
      showSuccessToast('Something went wrong', 'error');
      return Promise.reject(error);
    }

    if (originalRequest?.url?.includes(REFRESH_TOKEN)) {
      store.dispatch(logout());

      showSuccessToast('Please login again.', 'error');
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
      } catch {
        store.dispatch(logout());
      }
    } else {
      showSuccessToast(
        error.response?.data?.message ||
          error.response?.data?.error?.message ||
          error.message ||
          'Something went wrong',
        'error',
      );
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
