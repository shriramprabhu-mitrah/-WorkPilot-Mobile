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
  old_password?: string;
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
  showSuccessToast?: (message: string, type: 'success' | 'error') => void;
  handleSuccess?: () => void;
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
  cover_img_url?: string;
}

// Get User

export interface GetUserResponse extends ApiResponse<User> {}

export interface UserValidateData {
  type: string;
  value: string;
  available: boolean;
}

export interface UserValidateResponse extends ApiResponse<UserValidateData> {}

// Organization Model

export interface Organization {
  id?: string;
  name: string;
  slug: string;
  domain: string;
  industry: string;
  is_active?: boolean;
  team_size: string;
  country: string;
  logo_url?: string;
  created_at?: string;
  updated_at?: string;
}

// Create Organization

export interface CreateOrganizationPayload {
  payload: FormData;
}

export interface CreateOrganizationResponse extends ApiResponse {}

export interface GetOrganizationResponse extends ApiResponse<Organization> {}

// Redux Auth State

export interface AuthState {
  loading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  message: string | null;
  user: User | null;
  organization: Organization | null;
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
  organizations: Organization;
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

export type GetCountriesResponse = ApiResponse<Country[]>;

export interface Country {
  id: string;
  name: string;
  iso2: string;
  iso3: string;
  phone_code: string;
  timezone: string[];
  flag_emoji: string;
  created_at: string;
  updated_at: string;
}

export interface createOrganizationResponse extends ApiResponse {}

export interface InviteOrganizationPayload {
  members: {
    email: string;
  }[];
}

export interface InviteOrganizationResponse extends ApiResponse {}

export interface UpdateOrganizationPayload {
  name?: string;
  domain?: string;
  team_size?: string;
  country_id?: string;
  logo?: {
    uri: string;
    name: string;
    type: string;
  } | null;
}

export type DropdownType = 'industry' | 'teamSize' | 'country' | null;

export interface FormState {
  name: string;
  slug: string;
  domain: string;
  industry: string;
  teamSize: string;
  selectedCountry: Country | null;
}

export interface LogoState {
  uri: string | null | undefined;
  name: string;
  type: string;
}

export interface UIState {
  activeDropdown: DropdownType;
  isPickerModalOpen: boolean;
  countrySearchQuery: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  organization_name: string;
  name: string;
  username: string;
  email: string;
  role: string;
  avatar_url: string | null;
  color: string | null;
  timezone: string;
  is_active: boolean;
  is_verified?: boolean;
  status?: string;
  created_at?: string;
  joined_at?: string;
  total_assigned?: number;
  in_progress?: number;
  completed?: number;
  completion_percentage?: number;
}

export interface OrganizationMemberMeta {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface GetOrganizationMembersResponse extends ApiResponse<
  OrganizationMember[]
> {
  meta?: OrganizationMemberMeta;
  pagination?: OrganizationMemberMeta;
}

export interface getOrganizationMemberPayload {
  page?: number;
  page_size?: number;
  full_name?: string;
  email?: string;
  username?: string;
  role?: string;
  is_active?: boolean;
  is_verified?: boolean;
  status?: string;
  timezone?: string;
  include_org_admins?: boolean;
  /** Changes the cache request without being sent to the API. */
  _refetchKey?: number;
}

// Roles & Permissions

export interface PermissionActions {
  view: boolean;
  add: boolean;
  modify: boolean;
  delete: boolean;
}

export interface RolePermissionsMap {
  projects?: PermissionActions;
  sprints?: PermissionActions;
  user_stories?: PermissionActions;
  tasks?: PermissionActions;
  comments?: PermissionActions;
  [key: string]: PermissionActions | undefined;
}

export interface RoleApiItem {
  id: string;
  organization_id: string;
  name: string;
  description: string;
  is_system: boolean;
  permissions: RolePermissionsMap;
  created_at: string;
  updated_at: string;
}

export interface GetRolesResponse extends ApiResponse<RoleApiItem[]> {}

export interface CreateRolePayload {
  name: string;
  permissions: RolePermissionsMap;
}

export interface CreateRoleResponse extends ApiResponse<RoleApiItem> {}

export interface UpdateRolePayload {
  permissions: RolePermissionsMap;
}

export interface UpdateRoleResponse extends ApiResponse<RoleApiItem> {}

export interface DeleteRoleResponse extends ApiResponse {}

// Use RoleApiItem instead of maintaining a duplicate Role interface.
export type Role = RoleApiItem;

export interface ActionMeta {
  key: keyof PermissionActions;
  label: string;
  subtitle: string;
  icon: any;
}

export interface GroupMeta {
  id: string;
  title: string;
  icon: any;
  actions: ActionMeta[];
}

export interface RemoveOrganizationMemberResponse {
  success: boolean;
  message: string;
}
