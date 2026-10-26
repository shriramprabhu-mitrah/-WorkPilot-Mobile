import { UserStory } from './project.type';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url: string;
  role: string;
}

export interface Activity {
  id: string;
  project_id: string;
  project_name: string;
  organization_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  details: string;
  created_at: string;
  title: string;
  task_key?: string;
  key?: string;
  item_type: string;
  user_story_id?: string;
  task_id?: string;
  story?: UserStory;
  description?: string;
  priority?: string;
  reporter_name?: string;
  reporter_id?: string;
  assignee_id?: string;
  assignee_name?: string;
  story_points?: string;
  user_story_name?: string;
  task_name?: string;
  sprint_name: string;
  sprint_id: string;
}

export interface ViewedItem {
  id: string;
  title: string;
  type: string;
  category?: string;
  key?: string;
  projectName?: string;
}

export interface PaginationMeta {
  page: number;
  page_size: number;
  total_pages: number;
  total_items: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface AuditResponse {
  success: boolean;
  status_code: number;
  message: string;
  data: {
    user: User | null;
    activities: Activity[];
    pagination?: PaginationMeta;
  };
  meta: PaginationMeta;
}

// Legacy types kept for backward compat
export interface ActivityResponse extends AuditResponse {}
export interface ViewResponse extends AuditResponse {}

export interface HomeState {
  user: User | null;
  activities: Activity[];
  viewed: ViewedItem[];
  pagination: PaginationMeta | null;
}

// Legacy alias kept for backward compat
export interface data {
  user: User | null;
  activities: Activity[];
}

export interface HomeResponse {
  data: data;
}

export interface ShortcutItem {
  id: string;
  title: string;
  subtitle?: string;
  iconName: string;
  type: string;
}

export interface ActivityItem {
  id: string;
  title: string;
  type: string;
  key?: string;
  projectName?: string;
  action: string;
  user: { name: string; avatarInitial: string };
  formattedDate: string;
}
export interface SearchItem {
  id: string;
  type?: string;
  title?: string;
  key?: string;
  description?: string;
  priority?: string;
  status?: string;
  project_id?: string;
  project_name?: string;
  project_slug?: string;
  userId?: string;
  full_name?: string;
  name?: string;
  username?: string;
  user_name?: string;
  email?: string;
  role?: string;
  avatar_url?: string | null;
  color?: string | null;
}

export interface CategoryPagination {
  page: number;
  page_size: number;
  has_next: boolean;
  total: number;
}

export interface SearchMeta {
  total: number;
  page: number;
  page_size: number;
  has_next: boolean;
  total_tasks?: number;
  total_user_stories?: number;
  total_projects?: number;
  total_members?: number;
  total_sprints?: number;
  pagination?: {
    tasks?: CategoryPagination;
    user_stories?: CategoryPagination;
    projects?: CategoryPagination;
    members?: CategoryPagination;
    sprints?: CategoryPagination;
  };
}

export interface SearchResponse {
  success: boolean;
  status_code: number;
  message: string;
  data: {
    tasks?: SearchItem[];
    user_stories?: SearchItem[];
    projects?: SearchItem[];
    members?: SearchItem[];
    sprints?: SearchItem[];
  };
  meta?: SearchMeta;
  pagination?: {
    tasks?: CategoryPagination;
    user_stories?: CategoryPagination;
    projects?: CategoryPagination;
    members?: CategoryPagination;
    sprints?: CategoryPagination;
  };
}

export interface UserInsights {
  total_assigned: number;
  in_progress: number;
  completed: number;
  completion_percentage: number;
}

export interface UserInsightsResponse {
  success: boolean;
  status_code: number;
  message: string;
  data: UserInsights;
}

export type SearchCategory =
  'all' | 'tasks' | 'user_stories' | 'projects' | 'members' | 'sprints';

export interface CategoryPagingState {
  page: number;
  has_next: boolean;
  total: number;
}

export const TYPE_MAPPING: Record<
  'tasks' | 'user_stories' | 'projects' | 'members' | 'sprints',
  string
> = {
  tasks: 'task',
  user_stories: 'user_story',
  projects: 'project',
  members: 'member',
  sprints: 'sprint',
};

export interface CategoryDataState {
  tasks: SearchItem[];
  user_stories: SearchItem[];
  projects: SearchItem[];
  members: SearchItem[];
  sprints: SearchItem[];
}
