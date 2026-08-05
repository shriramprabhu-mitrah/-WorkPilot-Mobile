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
