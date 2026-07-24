import { createAsyncThunk } from '@reduxjs/toolkit';

import {
  signUpService,
  signInService,
  refreshTokenService,
  logoutService,
  changePasswordService,
  passwordResetRequestService,
  passwordResetConfirmService,
} from '../../../services/auth.service';

import {
  AuthState,
  SignUpPayload,
  SignInPayload,
  ChangePasswordPayload,
  PasswordResetRequestPayload,
  PasswordResetConfirmPayload,
} from '../../../types/auth.type';
// import { storage } from '../../../storage/storage';
import { clearStorage, mmkv } from '../..';

interface SignInThunkPayload {
  payload: SignInPayload;
}

export const signUpUser = createAsyncThunk(
  'auth/signUpUser',
  async (payload: SignUpPayload, { rejectWithValue }) => {
    try {
      const response = await signUpService(payload);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Sign Up Failed');
    }
  },
);

export const signInUser = createAsyncThunk(
  'auth/signInUser',
  async ({ payload }: SignInThunkPayload, { rejectWithValue }) => {
    try {
      const response = await signInService(payload);
      console.log('SignIn Response -------->', response);
      if (response.message.includes('Successfully') && response.success) {
        return response.data;
      }
      return rejectWithValue('Login Failed');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Login Failed');
    }
  },
);

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as {
        auth: AuthState;
      };
      const refreshToken = state.auth.tokens?.refreshToken;

      if (!refreshToken) {
        return rejectWithValue('Refresh Token Missing');
      }

      const response = await refreshTokenService({
        refresh_token: refreshToken,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Refresh Token Failed',
      );
    }
  },
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await logoutService();
      console.log('LoginoutResponse', response);
      if (response.message.includes('successfully') && response.success) {
        clearStorage();
        return response;
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Logout Failed');
    }
  },
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (payload: ChangePasswordPayload, { rejectWithValue }) => {
    try {
      const response = await changePasswordService(payload);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Change Password Failed',
      );
    }
  },
);

export const passwordResetRequest = createAsyncThunk(
  'auth/passwordResetRequest',
  async (payload: PasswordResetRequestPayload, { rejectWithValue }) => {
    try {
      const response = await passwordResetRequestService(payload);
      console.log('response for reset Password ---------- > 104', response);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Password Reset Request Failed',
      );
    }
  },
);

export const passwordResetConfirm = createAsyncThunk(
  'auth/passwordResetConfirm',
  async (payload: PasswordResetConfirmPayload, { rejectWithValue }) => {
    try {
      const response = await passwordResetConfirmService(payload);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Password Reset Failed',
      );
    }
  },
);

export const checkAuthOnAppStart = createAsyncThunk(
  'auth/checkAuthOnAppStart',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const { isAuthenticated, tokens } = state.auth;

      if (!isAuthenticated || !tokens?.accessToken || !tokens?.refreshToken) {
        return rejectWithValue('Not Authenticated') || tokens;
        // return tokens;
      }
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);
