// import axios, {
//   AxiosInstance,
//   AxiosRequestConfig,
//   AxiosResponse,
//   InternalAxiosRequestConfig,
// } from 'axios';
// import { store } from '../../store/store;
// import { Platform } from 'react-native';
// // import { refreshToken, logoutUser } from '../store/auth_store/action/auth.thunks';

// // Direct baseURL - update this as needed
// let baseURL = 'https://api-demo-tcxe.tnpdigitallab.com';

// const apiClient: AxiosInstance = axios.create({
//   baseURL,
//   timeout: 10000,
//   headers: {
//     'Content-Type': 'application/json',
//     'App-Version': '1.0',
//     platform: Platform.OS === 'android' ? '1' : '2',
//   },
// });

// // Request interceptor - add auth token if available
// apiClient.interceptors.request.use(
//   async (config: InternalAxiosRequestConfig) => {
//     let token = store.getState().auth?.tokens?.accessToken;

//     if (config.url?.includes('/auth/validate-token')) {
//       token = store.getState().auth?.tokens?.refreshToken;
//     }

//     if (token) {
//       config.headers['Authorization'] = `Bearer ${token}`;
//     }
       

//     return config;
//   },
//   error => Promise.reject(error),
// );

// // Response interceptor - handle token refresh
// apiClient.interceptors.response.use(
//   (response: AxiosResponse) => {
  
//     return response;
//   },
//   async (error: any) => {
//     const originalRequest = error.config;

//     // ✅ If validate token endpoint fails, don't try to refresh - just logoutUser
//     if (originalRequest.url?.includes('/auth/validate-token')) {
//       console.error('❌ Validate token endpoint failed - logging out');
//       store.dispatch(logoutUser());
//       return Promise.reject(error);
//     }

//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;

//       try {
//         const refreshTokenValue = store.getState().auth?.tokens?.refreshToken;

//         if (refreshTokenValue) {
//           const result = await store.dispatch(refreshToken());

//           if (refreshToken.fulfilled.match(result)) {
//             // Retry original request with new token
//             const newToken = store.getState().auth?.tokens?.accessToken;
//             originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
//             return apiClient(originalRequest);
//           }
//         }
//       } catch (refreshError) {
//         console.error('Token refresh failed:', refreshError);
//         // Logout user if refresh fails
//         store.dispatch(logoutUser());
//       }
//     }

//     console.error('API Error:', error.response?.data || error.message);
//     return Promise.reject(error);
//   },
// );

// // HTTP methods
// const get = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
//   const response = await apiClient.get<T>(url, config);
//   return response.data;
// };

// const post = async <T, D = any>(
//   url: string,
//   data?: D,
//   config?: AxiosRequestConfig,
// ): Promise<T> => {
//   const response = await apiClient.post<T>(url, data, config);
//   return response.data;
// };

// const put = async <T, D = any>(
//   url: string,
//   data?: D,
//   config?: AxiosRequestConfig,
// ): Promise<T> => {
//   const response = await apiClient.put<T>(url, data, config);
//   return response.data;
// };

// const patch = async <T, D = any>(
//   url: string,
//   data?: D,
//   config?: AxiosRequestConfig,
// ): Promise<T> => {
//   const response = await apiClient.patch<T>(url, data, config);
//   return response.data;
// };

// const del = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
//   const response = await apiClient.delete<T>(url, config);
//   return response.data;
// };

// export const setBaseURL = (newUrl: string) => {
//   baseURL = newUrl;
//   apiClient.defaults.baseURL = newUrl; // Update axios client too
// };
// export const getBaseURL = () => baseURL;
// export { get, post, put, patch, del };
// export default apiClient;
