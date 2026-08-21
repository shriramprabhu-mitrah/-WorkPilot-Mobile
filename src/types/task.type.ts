import { Task } from './project.type';

export interface UpdateTaskPayload {
  user_story_id?: string;
  status_id?: string;
}

export interface UpdateTaskResponse {
  success: boolean;
  status_code: number;
  message: string;
  data: Task;
}
