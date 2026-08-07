//  Common API Response
export interface UpdateUserProfilePayload {
  full_name?: string;
  username?: string;
  timezone?: string;
  avatar?: string;
}

export interface UserProfile {
  id: string;
  organization_id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  avatar_url: string;
  timezone: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  joined_at: string;
}

export interface UserState {
  loading: boolean;
  updating: boolean;
  error: string | null;
  message: string | null;
  user: UserProfile | null;
}

export interface UpdateUserResponse {
  success: boolean;
  status_code: number;
  message: string;
  data: UserProfile;
}

export interface UpdateUserPayload {
  full_name: string;
  username: string;
  avatar_url: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  status_code: number;
  message: string;
  data?: T;
}

// Token Model

export interface TokenData {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  refresh_expires_in: number;
}

//  Sign Up

export interface SignUpPayload {
  full_name: string;
  username: string;
  email: string;
  role: string;
  password: string;
  avatar_url?: string;
  timezone?: string;
}

export interface SignUpResponse extends ApiResponse {}

// Sign In

export interface SignInPayload {
  email: string;
  password: string;
}

export interface SignInResponse extends ApiResponse<TokenData> {}

// Refresh Token

export interface RefreshTokenPayload {
  refresh_token: string;
  user_id: string;
}

export interface RefreshTokenResponse extends ApiResponse<TokenData> {}

// Logout

export interface LogoutResponse extends ApiResponse {}

// Change Password

export interface ChangePasswordPayload {
  old_password: string;
  new_password: string;
}

export interface ChangePasswordResponse extends ApiResponse {}

// Password Reset Request

export interface PasswordResetRequestPayload {
  email: string;
}

export interface PasswordResetRequestResponse extends ApiResponse {}

// Password Reset Confirm

export interface PasswordResetConfirmPayload {
  email: string;
  otp: string;
  new_password: string;
}

export interface PasswordResetConfirmResponse extends ApiResponse {}

export interface EmailVerificationPayload {
  email: string;
  otp: string;
}

export interface EmailVerificationResponse extends ApiResponse {}

export interface ResendEmailVerificationPayload {
  email: string;
}

export interface ResendEmailVerificationResponse extends ApiResponse {}

// Update User
export interface UpdateUserProfileThunkPayload {
  formData: FormData;
  showSuccessToast: (message: string, type: 'success' | 'error') => void;
  handleSuccess: () => void;
}

export interface UpdateUserPayload extends UpdateUserProfilePayload {
  accessToken: string;
}

export interface UpdateUserResponse extends ApiResponse {}

//  User Model

export interface User {
  id: string;
  role: string;
  name?: string;
  username?: string;
  email?: string;
  password_hash?: string;
  avatar_url?: string;
  timezone?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Get User

export interface GetUserResponse extends ApiResponse<User> {}

export interface UserValidateResponse extends ApiResponse {}

// Organization Model

export interface Organization {
  id?: string;
  name: string;
  domain: string;
  logo_url?: string;
  created_at?: string;
  updated_at?: string;
}

// Create Organization

export interface CreateOrganizationPayload {
  name: string;
  domain: string;
  logo_url?: string;
}

export interface CreateOrganizationResponse extends ApiResponse {}

// Redux Auth State

export interface AuthState {
  loading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  message: string | null;
  user: User | null;
  tokens:
    | {
        accessToken: string | null;
        refreshToken: string | null;
      }
    | undefined;
}

//   Redux Organization State

export interface OrganizationState {
  loading: boolean;
  organizations: Organization[];
  error: string | null;
  message: string | null;
}

//  Redux Password Reset State

export interface PasswordResetState {
  loading: boolean;
  success: boolean;
  error: string | null;
  message: string | null;
}
