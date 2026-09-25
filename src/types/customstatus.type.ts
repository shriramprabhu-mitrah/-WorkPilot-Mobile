export interface CustomStatus {
  id: string;
  project_id: string;
  name: string;
  color: string;
  display_order: number;
  is_default: boolean;
  is_final?: boolean;
}

export interface StatusMutationPayload {
  name: string;
  color: string;
  display_order: number;
  is_final: boolean;
}

export interface StatusMutationArgs extends StatusMutationPayload {
  project_id: string;
  status_id?: string;
}

export interface StatusMutationResponse {
  success?: boolean;
  status_code?: number;
  message?: string;
  data?: CustomStatus | UserStoryStatusItem | string;
}

export interface GetCustomStatusResponse {
  success: boolean;
  status_code: number;
  message: string;
  data: CustomStatus[];
}

export interface UserStoryStatusItem {
  id: string;
  project_id?: string;
  name: string;
  color: string;
  display_order: number;
  is_default?: boolean;
  is_closed?: boolean;
  is_final?: boolean;
}

export interface GetUserStoryStatusResponse {
  success: boolean;
  status_code: number;
  message: string;
  data: UserStoryStatusItem[];
}
