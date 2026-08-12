import { createAsyncThunk } from '@reduxjs/toolkit';

import {
  signUpService,
  signInService,
  refreshTokenService,
  logoutService,
  changePasswordService,
  passwordResetRequestService,
  passwordResetConfirmService,
  emailVerificationService,
  ResendEmailVerificationService,
  updateUserService,
  getUserService,
  getOrganizationDetailService,
} from '../../../services/auth.service';

import {
  AuthState,
  SignUpPayload,
  SignInPayload,
  ChangePasswordPayload,
  PasswordResetRequestPayload,
  PasswordResetConfirmPayload,
  EmailVerificationPayload,
  ResendEmailVerificationPayload,
  UpdateUserResponse,
  UpdateUserProfileThunkPayload,
} from '../../../types/auth.type';
// import { storage } from '../../../storage/storage';
import { handleLoading } from '../reducer/auth.reducer';
import { clearStorage } from '../../store';
interface SignInThunkPayload {
  payload: SignInPayload;
  showSuccessToast: (message: string, type: string) => void;
}

export const signUpUser = createAsyncThunk(
  'auth/signUpUser',
  async (payload: SignUpPayload, { rejectWithValue }) => {
    try {
      const response = await signUpService(payload);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error?.message || 'Sign Up Failed',
      );
    }
  },
);

export const signInUser = createAsyncThunk(
  'auth/signInUser',
  async ({ payload }: SignInThunkPayload, { dispatch, rejectWithValue }) => {
    try {
      const response = await signInService(payload);
      console.log('SignIn Response -------->', response);
      if (response?.success) {
        return response.data;
      }
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error?.message || 'login failed',
      );
    } finally {
      dispatch(handleLoading(false));
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
      const userid = state?.auth?.user?.id;
      if (!refreshToken) {
        return rejectWithValue('Refresh Token Missing');
      }
      const response = await refreshTokenService({
        refresh_token: refreshToken,
        user_id: userid || '',
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error?.message || 'Refresh Token Failed',
      );
    }
  },
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (
    showSuccessToast: (message: string, type: string) => void,
    { rejectWithValue },
  ) => {
    try {
      const response = await logoutService();
      console.log('LoginoutResponse', response);
      if (response.message.includes('successfully') && response.success) {
        clearStorage();
        showSuccessToast(
          response.message || 'Loggedout successfully',
          'success',
        );
        return response;
      }
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error?.message || 'Logout Failed',
      );
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
        error.response?.data?.error?.message || 'Change Password Failed',
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
        error.response?.data?.error?.message || 'Password Reset Request Failed',
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
        error.response?.data?.error?.message || 'Password Reset Failed',
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

export const emailVerification = createAsyncThunk(
  'auth/verify-email',
  async (payload: EmailVerificationPayload, { rejectWithValue }) => {
    try {
      const response = await emailVerificationService(payload);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error?.message || 'Email verification failed',
      );
    }
  },
);

export const resendEmailVerification = createAsyncThunk(
  'auth/verify-email',
  async (payload: ResendEmailVerificationPayload, { rejectWithValue }) => {
    try {
      const response = await ResendEmailVerificationService(payload);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error?.message || 'Resend verification failed',
      );
    }
  },
);

export const getUserProfileInfo = createAsyncThunk(
  'auth/me',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getUserService();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch user profile',
      );
    }
  },
);

export const getOrganizationDetail = createAsyncThunk(
  'auth/userOrganization',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getOrganizationDetailService();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch organization detail',
      );
    }
  },
);
export const updateUserProfileInfo = createAsyncThunk<
  UpdateUserResponse,
  UpdateUserProfileThunkPayload,
  { rejectValue: string }
>(
  'auth/update-profile',
  async (
    { formData, showSuccessToast, handleSuccess },
    { dispatch, rejectWithValue },
  ) => {
    try {
      const response = await updateUserService(formData);
      if (response.success) {
        showSuccessToast(
          response.message || 'Profile updated successfully',
          'success',
        );
        handleSuccess();
        return response;
      }
      return rejectWithValue('User Data Update Failed');
    } catch (error: any) {
      showSuccessToast(
        error.response?.data?.message || 'User Data Update Failed',
        'error',
      );
      return rejectWithValue(
        error.response?.data?.message || 'User Data Update Failed',
      );
    } finally {
      dispatch(handleLoading(false));
    }
  },
);
