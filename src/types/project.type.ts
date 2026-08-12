import { ApiResponse } from './auth.type';

export interface GetProjectsResponse extends ApiResponse {}

export interface GetProjectsParams {
  page?: number;
  page_size?: number;
  name?: string;
  status?: string;
}

export interface Project {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  status: string;
  created_by: string;
  created_at: string;
  sprint_count: number;
}

export interface ProjectState {
  projects: any[];
  loading: boolean;
  isFetchingMore: boolean;
  page: number;
  hasMore: boolean;
  error: string | null;
}

export interface CreateProjectPayload {
  name: string;
  description?: string;
}

export interface CreateProjectResponse {
  success: boolean;
  status_code: number;
  message: string;
}

export interface CreateProjectThunkParams {
  payload: CreateProjectPayload;
  showSuccessToast?: (message: string, type: string) => void;
  handleSuccess?: () => void;
}

export interface UpdateProjectPayload {
  name?: string;
  description?: string;
  status?: string;
}

export interface UpdateProjectResponse {
  success: boolean;
  status_code: number;
  message: string;
  data?: Project;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
}

export interface UpdateProjectThunkPayload {
  projectId: string;
  payload: UpdateProjectPayload;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
  onFinally?: () => void;
}
