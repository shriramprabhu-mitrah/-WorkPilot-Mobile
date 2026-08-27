export interface BoardCard {
  id: string;
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  assignee?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface BoardColumn {
  id: string;
  title: string;
  color?: string;
  cards: BoardCard[];
}

export interface ProjectBoard {
  projectId: string;
  columns: BoardColumn[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  color: string;
}

export interface UserStory {
  id: string;
  project_id: string;
  project_name: string;
  sprint_id: string | null;
  serial_number: number;
  formatted_serial_number: string;
  title: string;
  priority: string;
  status_id: string;
  status: string;
  status_color: string;
  is_closed: boolean;
  is_favourite: boolean;
  story_points: number;
  reporter_id: string;
  reporter_name: string;
  reporter: User;
  backlog_order: number;
  total_tasks: number;
  completed_tasks: number;
  progress: number;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  project_id: string;
  project_name: string;
  sprint_id: string | null;
  sprint_name: string;
  user_story_id: string;
  key: string;
  serial_number: number;
  formatted_serial_number: string;
  title: string;
  type: string;
  priority: string;
  status_id: string;
  status: string;
  status_color: string;
  is_final: boolean;
  is_favourite: boolean;
  assignee_id: string;
  reporter_id: string;
  reporter_name: string;
  assignee_name: string;
  story_points: number;
  due_date: string | null;
  estimated_hours: number;
  actual_hours: number;
  created_at: string;
  updated_at: string;
  reporter: User;
  assignee: User;
}

// ── Discriminated Unions for Favorites ──

export interface BaseFavoriteItem {
  id: string;
  user_id: string;
  project_id: string;
  project_name: string;
  created_at: string;
}

export interface FavoriteUserStoryItem extends BaseFavoriteItem {
  item_type: 'user_story';
  user_story_id: string;
  user_story_name: string;
  user_story_title: string;
  user_story: UserStory;
}

export interface FavoriteTaskItem extends BaseFavoriteItem {
  item_type: 'task';
  task_id: string;
  task_name: string;
  task_title: string;
  task: Task;
}

export type FavoriteItem = FavoriteUserStoryItem | FavoriteTaskItem;

// ── Root Response Structures ──

export interface FavoritesData {
  favorites: FavoriteItem[];
  total: number;
  total_user_stories: number;
  total_tasks: number;
}

export interface PaginationMeta {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface GetFavoritesResponse {
  success: boolean;
  status_code: number;
  message: string;
  data: FavoritesData;
  meta: PaginationMeta;
}

export interface GetFavouritesParams {
  item_type?: string;
  search?: string;
  sort_by?: string;
  sort_order?: string;
  page?: number;
  page_size?: number;
}
