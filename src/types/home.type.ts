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
  organization_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  details: string;
  created_at: string;
  title: string;
  task_key?: string;
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
  total: number;
  total_pages: number;
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
