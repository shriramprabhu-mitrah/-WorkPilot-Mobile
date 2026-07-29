import { get, patch, post } from '../components/common/httpClient';
import {
  SIGNUP,
  SIGNIN,
  REFRESH_TOKEN,
  LOGOUT,
  CHANGE_PASSWORD,
  GET_USER,
  UPDATE_USER,
  PASSWORD_RESET_REQUEST,
  PASSWORD_RESET_CONFIRM,
  EMAIL_VERIFICATION,
  RESEND_EMAIL_VERIFICATION,
} from '../constants/apiServiceEndpoint';

import {
  SignUpPayload,
  SignUpResponse,
  SignInPayload,
  SignInResponse,
  RefreshTokenPayload,
  RefreshTokenResponse,
  LogoutResponse,
  ChangePasswordPayload,
  ChangePasswordResponse,
  GetUserResponse,
  UpdateUserPayload,
  UpdateUserResponse,
  PasswordResetRequestPayload,
  PasswordResetRequestResponse,
  PasswordResetConfirmPayload,
  PasswordResetConfirmResponse,
  EmailVerificationPayload,
  EmailVerificationResponse,
  ResendEmailVerificationPayload,
  ResendEmailVerificationResponse,
} from '../types/auth.type';

/**
 * ===========================
 * Sign Up
 * ===========================
 */

export const signUpService = async (
  payload: SignUpPayload,
): Promise<SignUpResponse> => {
  try {
    return await post<SignUpResponse, SignUpPayload>(SIGNUP, payload);
  } catch (error) {
    console.error('Sign Up API failed:', error);
    throw error;
  }
};

/**
 * ===========================
 * Sign In
 * ===========================
 */

export const signInService = async (
  payload: SignInPayload,
): Promise<SignInResponse> => {
  try {
    return await post<SignInResponse, SignInPayload>(SIGNIN, payload);
  } catch (error) {
    console.error('Sign In API failed:', error);
    throw error;
  }
};

/**
 * ===========================
 * Refresh Token
 * ===========================
 */

export const refreshTokenService = async (
  payload: RefreshTokenPayload,
): Promise<RefreshTokenResponse> => {
  try {
    return await post<RefreshTokenResponse, RefreshTokenPayload>(
      REFRESH_TOKEN,
      payload,
    );
  } catch (error) {
    console.error('Refresh Token API failed:', error);
    throw error;
  }
};

/**
 * ===========================
 * Logout
 * ===========================
 */

export const logoutService = async (): Promise<LogoutResponse> => {
  try {
    return await post<LogoutResponse>(LOGOUT);
  } catch (error) {
    console.error('Logout API failed:', error);
    throw error;
  }
};

/**
 * ===========================
 * Change Password
 * ===========================
 */

export const changePasswordService = async (
  payload: ChangePasswordPayload,
): Promise<ChangePasswordResponse> => {
  try {
    return await post<ChangePasswordResponse, ChangePasswordPayload>(
      CHANGE_PASSWORD,
      payload,
    );
  } catch (error) {
    console.error('Change Password API failed:', error);
    throw error;
  }
};

/**
 * ===========================
 * Get User Profile
 * ===========================
 */

export const getUserService = async (): Promise<GetUserResponse> => {
  try {
    return await get<GetUserResponse>(GET_USER);
  } catch (error) {
    console.error('Get User API failed:', error);
    throw error;
  }
};

/**
 * ===========================
 * Update User Profile
 * ===========================
 */

export const updateUserService = async (
  payload: UpdateUserPayload,
): Promise<UpdateUserResponse> => {
  try {
    return await patch<UpdateUserResponse, UpdateUserPayload>(
      UPDATE_USER,
      payload,
    );
  } catch (error) {
    console.error('Update User API failed:', error);
    throw error;
  }
};

/**
 * ===========================
 * Password Reset Request
 * ===========================
 */

export const passwordResetRequestService = async (
  payload: PasswordResetRequestPayload,
): Promise<PasswordResetRequestResponse> => {
  try {
    return await post<
      PasswordResetRequestResponse,
      PasswordResetRequestPayload
    >(PASSWORD_RESET_REQUEST, payload);
  } catch (error) {
    console.error('Password Reset Request API failed:', error);
    throw error;
  }
};

/**
 * ===========================
 * Password Reset Confirm
 * ===========================
 */

export const passwordResetConfirmService = async (
  payload: PasswordResetConfirmPayload,
): Promise<PasswordResetConfirmResponse> => {
  try {
    return await post<
      PasswordResetConfirmResponse,
      PasswordResetConfirmPayload
    >(PASSWORD_RESET_CONFIRM, payload);
  } catch (error) {
    console.error('Password Reset Confirm API failed:', error);
    throw error;
  }
};

export const emailVerificationService = async (
  payload: EmailVerificationPayload,
): Promise<EmailVerificationResponse> => {
  try {
    return await post<EmailVerificationResponse, EmailVerificationPayload>(
      EMAIL_VERIFICATION,
      payload,
    );
  } catch (error) {
    console.error('Password Reset Confirm API failed:', error);
    throw error;
  }
};

export const ResendEmailVerificationService = async (
  payload: ResendEmailVerificationPayload,
): Promise<ResendEmailVerificationResponse> => {
  try {
    return await post<
      ResendEmailVerificationResponse,
      ResendEmailVerificationPayload
    >(RESEND_EMAIL_VERIFICATION, payload);
  } catch (error) {
    console.error('Password Reset Confirm API failed:', error);
    throw error;
  }
};
