export interface UserStory {
  id: string;
  project_id: string;
  sprint_id: string;
  sprint_name: string;
  serial_number: number;
  formatted_serial_number: string;
  title: string;
  description: string;
  priority: string;
  status_id: string;
  status: string;
  status_color: string;
  story_points: number;
  reporter_id: string;
  reporter_name: string;
  backlog_order: number;
  total_tasks: number;
  completed_tasks: number;
  progress: number;
  created_at: string;
  updated_at: string;
  tasks?: TaskItem[];
}

export interface TaskItem {
  id: string;
  project_id: string;
  sprint_id: string | null;
  sprint_name: string;
  user_story_id: string;
  key: string;
  serial_number: number;
  formatted_serial_number: string;
  title: string;
  description: string;
  type: string;
  priority: string;
  status_id: string;
  status: string;
  status_color: string;
  assignee_id: string;
  reporter_id: string;
  reporter_name: string;
  assignee_name: string;
  story_points: number;
  due_date: string;
  estimated_hours: number;
  actual_hours: number;
}
