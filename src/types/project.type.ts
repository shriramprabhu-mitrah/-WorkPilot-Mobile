import { ApiResponse } from './auth.type';

export interface GetProjectsResponse extends ApiResponse {}

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
  projects: Project[];
  loading: boolean;
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
