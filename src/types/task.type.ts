import { Task } from './project.type';

export interface UpdateTaskPayload {
  user_story_id?: string;
  status_id?: string;
  priority?: string;
  story_points?: number;
  description?: string;
}

export interface UpdateTaskResponse {
  success: boolean;
  status_code: number;
  message: string;
  data: Task;
}

export interface CreateTaskPayload {
  title: string;
  type?: string;
  description?: string;
  assignee_id?: string | null;
  status_id?: string;
  due_date?: string | null;
  priority?: string;
  estimated_hours?: number;
  actual_hours?: number;
  story_points?: number;
  user_story_id?: string;
}

export interface CreateTaskResponse {
  success: boolean;
  status_code: number;
  message: string;
  data: Task;
}

export interface TaskMeta {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface GetTasksParams {
  projectId: string;
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_order?: string;
  status_id?: string;
  assignee_id?: string;
  reporter_id?: string;
  sprint_id?: string;
  user_story_id?: string;
  type?: string;
  priority?: string;
  search?: string;
  labels?: string;
  is_deleted?: boolean;
  match?: string;
}

export interface GetTasksResponse {
  success: boolean;
  status_code: number;
  message: string;
  data: Task[];
  meta: TaskMeta;
}
