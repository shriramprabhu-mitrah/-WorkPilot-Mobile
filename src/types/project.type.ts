import { ApiResponse } from './auth.type';

export interface GetProjectsResponse extends ApiResponse {
  meta?: {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
  };
}

export interface GetSprintResponse extends ApiResponse {
  meta?: {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
  };
}

export interface GetSprintByIdResponse extends ApiResponse {}
export interface GetProjectsParams {
  page?: number;
  page_size?: number;
  name?: string;
  status?: string;
  include_sprints?: boolean;
}
export interface GetRecentProjectResponse extends ApiResponse {
  data: {
    user_id: string;
    user_name: string;
    full_name: string;
    email: string;
    role: string;
    project: RecentProject[];
  };
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

export interface Sprint {
  id: string;
  name: string;
  status: string;
  start_date: string;
  end_date: string;
}

export interface CreateSprintPayload {
  name: string;
  goal: string;
  start_date: string;
  end_date: string;
}

export interface CreateSprintResponse extends ApiResponse<{ sprint_id: string }> {}

export interface GetSprintByIdParams {
  project_id: string;
  sprint_id: string;
}

export interface GetSprintsParams {
  project_id: string;
  page?: number;
  page_size?: number;
  status?: string;
  search?: string;
  sort_by?: string;
  sort_order?: string;
  fieldName?: string;
}

export interface RecentProject {
  project_id: string;
  role: string;
  project_name: string;
  status: string;
}
export interface ProjectState {
  projects: Project[];
  project: ProjectDetails | null;
  loading: boolean;
  isFetchingMore: boolean;
  include_sprints: boolean;
  page: number;
  hasMore: boolean;
  error: string | null;
  sprints: Sprint[];
  currentSprint: Sprint;
  active_sprint?: Sprint | null;
  recentProjects: RecentProject[] | null;
  sprintLoading?: boolean;
  projectLoading?: boolean;
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
  handleSuccess?: (message?: string) => void;
  handleError?: (message?: string) => void;
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

export interface ProjectMember {
  user_id: string;
  username: string;
  full_name: string;
  role: string;
  avatar_url: string | null;
  color: string;
  organization_name: string;
  project_key: string;
}

export interface ProjectMembersMeta {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface GetProjectMembersResponse extends ApiResponse<
  ProjectMember[]
> {
  meta: ProjectMembersMeta;
}

export interface GetProjectMembersQueryArgs {
  project_id: string;
  page?: number;
  page_size?: number;
  name?: string;
  /** Changing this value forces a refetch. Not sent to the API. */
  _refetchKey?: number;
}

export interface RemoveProjectMemberResponse extends ApiResponse {}

export interface RemoveProjectMemberArgs {
  project_id: string;
  user_id: string;
}

export interface ProjectMetrics {
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  overdue_tasks: number;
  completed_tasks_percentage: number;
  total_sprints: number;
  active_sprints: number;
  completed_sprints: number;
  total_members: number;
}

export interface GetProjectByIdThunkPayload {
  projectId: string;
  handleSuccess?: () => void;
}

export interface ProjectDetails {
  id: string;
  organization_id: string;
  name: string;
  description: string;
  status: string;
  created_by: string;
  creator: string;
  created_at: string;
  members: ProjectMember[];
  sprints: any[];
  active_sprint: Sprint;
  metrics: ProjectMetrics;
}

export interface GetProjectByIdResponse {
  success: boolean;
  status_code: number;
  message: string;
  data: ProjectDetails;
}

export interface ProjectOverviewMetrics {
  completed: number;
  due_soon: number;
  overdue: number;
  pending: number;
  total_tasks: number;
}

export interface GetProjectOverviewResponse {
  success: boolean;
  status_code: number;
  message: string;
  data: ProjectOverviewMetrics;
}

export interface GetProjectOverviewParams {
  project_id: string;
  sprint_id?: string;
}

export interface GetProjectsQueryArgs extends GetProjectsParams {
  /** Changing this value forces a refetch. Not sent to the API. */
  _refetchKey?: number;
}

export interface GetSprintsQueryArgs extends GetSprintsParams {
  /** Changing this value forces a refetch. Not sent to the API. */
  _refetchKey?: number;
}

export interface GetProjectByIdQueryArgs {
  project_id: string;
  _refetchKey?: number;
}

export interface GetSprintByIdQueryArgs extends GetSprintByIdParams {
  _refetchKey?: number;
}

export interface GetProjectOverviewQueryArgs {
  project_id: string;
  sprint_id?: string;
  _refetchKey?: number;
}

export interface GetCustomStatusQueryArgs {
  project_id: string;
  _refetchKey?: number;
}

export interface GetUserStoryStatusQueryArgs {
  project_id: string;
  _refetchKey?: number;
}

export interface GetUserStoriesQueryArgs extends GetUserStorieThunkArgs {
  _refetchKey?: number;
}

export interface GetTaskByIdQueryArgs extends GetTaskByIdParams {
  _refetchKey?: number;
}

export interface GetBurndownChartQueryArgs extends GetBurnbownParams {
  _refetchKey?: number;
}

export interface DeleteProjectResponse {
  data: string;
  message: string;
  meta: {
    has_next: boolean;
    has_previous: boolean;
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
  };
  status_code: number;
  success: boolean;
}

export interface DeleteProjectPayload {
  projectId: string;
  onSuccess?: (message?: string) => void;
  onError?: (errorMessage?: string) => void;
  onFinally?: () => void;
}

export interface UserStory {
  id: string;
  project_id: string;
  sprint_id: string;
  sprint_name: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  story_points: number;
  assignee_id: string;
  assignee_name: string;
  reporter_id: string;
  reporter_name: string;
  reporter: UserStoryReporter;
  assignee: UserStoryAssignee;
  backlog_order: number;
  total_tasks: number;
  completed_tasks: number;
  progress: number;
  created_at: string;
  updated_at: string;
}

export interface UserStoryReporter {
  id: string;
  name: string;
  email: string;
  avatar_url: string;
  role: string;
}

export interface UserStoryAssignee {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface UserStoryMeta {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface GetUserStoriesResponse {
  success: boolean;
  status_code: number;
  message: string;
  data: UserStory[];
  meta: UserStoryMeta;
}

export interface GetUserStoriesPayload {
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_order?: string;
  status?: string;
  assignee_id?: string;
  reporter_id?: string;
  sprint_id?: string | null;
  priority?: string;
  search?: string;
}

export interface GetUserStorieThunkArgs {
  projectId: string;
  payload?: GetUserStoriesPayload;
}

export interface GetUserStoryByIdParams {
  projectId: string;
  userStoryId: string;
}

export interface UserRoleInfo {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar_url?: string;
}

export interface Task {
  id: string;
  project_id: string;
  sprint_id: string | null;
  sprint_name: string;
  user_story_id: string;
  user_story_title: string;
  key: string;
  serial_number: number;
  formatted_serial_number: string;
  title: string;
  description?: string;
  type: string;
  priority: string;
  status_id: string;
  status: string;
  status_color: string;
  is_final: boolean;
  assignee_id: string | null;
  reporter_id: string | null;
  reporter_name: string;
  assignee_name: string;
  story_points: number;
  due_date: string | null;
  estimated_hours: number;
  actual_hours: number;
  created_at: string;
  updated_at: string;
  reporter: UserRoleInfo;
  assignee: UserRoleInfo;
}

export interface UserStoryDetail {
  id: string;
  project_id: string;
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
  reporter: UserRoleInfo;
  backlog_order: number;
  total_tasks: number;
  completed_tasks: number;
  progress: number;
  created_at: string;
  updated_at: string;
  tasks: Task[];
}

export interface GetUserStoryByIdResponse {
  success: boolean;
  status_code: number;
  message: string;
  data: UserStoryDetail;
}

export interface GetTaskByIdParams {
  projectId: string;
  taskId: string;
}

export interface TaskReporter {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface TaskData {
  id: string;
  project_id: string;
  sprint_id: string | null;
  sprint_name: string;
  user_story_id: string;
  user_story_title: string;
  key: string;
  serial_number: number;
  formatted_serial_number: string;
  title: string;
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
  created_at: string;
  updated_at: string;
  reporter: TaskReporter;
}

export interface GetTaskByIdResponse {
  success: boolean;
  status_code: number;
  message: string;
  data: TaskData;
}

export type UserStoryPriority = 'low' | 'medium' | 'high' | 'critical';

export type UserStoryStatus =
  'todo' | 'in_progress' | 'in_review' | 'testing' | 'completed' | 'blocked';

export interface UpdateUserStoryPayload {
  assignee_id?: string;
  description?: string;
  priority?: UserStoryPriority;
  sprint_id?: string;
  status?: UserStoryStatus;
  story_points?: number;
  title?: string;
  status_id?: string;
}

export interface UpdateUserStoryResponse {
  success: boolean;
  status_code: number;
  message: string;
  data: UserStoryDetail;
}

export interface GetBurnbownParams {
  projectId: string;
  sprintId?: string | null;
}

export interface BurndownDayPoint {
  day: number;
  date: string;
  ideal_hours: number;
  actual_hours: number;
}

export interface SprintBurndownItem {
  sprint_id: string;
  sprint_name: string;
  data: BurndownDayPoint[];
}

export interface SprintBurndownData {
  sprint_burndown?: SprintBurndownItem[];
  // Legacy fields kept for backward compatibility if needed
  sprint_id?: string;
  sprint_name?: string;
  total_story_points?: number;
  burndown_data?: {
    date: string;
    remaining_points: number | null;
    ideal_value: number;
  }[];
}

export interface GetBurndownResponse extends ApiResponse {
  data: SprintBurndownData;
}

export interface TeamWorkloadMember {
  user_id?: string;
  id?: string;
  user_name?: string;
  name?: string;
  username?: string;
  email?: string;
  profile_picture?: string;
  avatar_url?: string;
  tasks_count?: number;
  total_tasks?: number;
  tasks?: number;
  story_points?: number;
  total_points?: number;
  points?: number;
  [key: string]: any;
}

export interface GetTeamWorkloadResponse extends ApiResponse {
  data: TeamWorkloadMember[];
}

export interface GetTeamWorkloadQueryArgs {
  projectId: string;
  sprintId?: string | null;
  _refetchKey?: number;
}

export interface WeeklyProgressDayItem {
  day: string;
  planned: number;
  completed: number;
  date?: string;
  [key: string]: any;
}

export interface GetWeeklyProgressResponse extends ApiResponse {
  data: WeeklyProgressDayItem[];
}

export interface GetWeeklyProgressQueryArgs {
  projectId: string;
  start_date?: string | null;
  end_date?: string | null;
  _refetchKey?: number;
}

export interface UserStoryTask {
  id: string;
  project_id: string;
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
  is_favourite: boolean;

  assignee_id: string | null;
  reporter_id: string | null;

  reporter_name: string;
  assignee_name: string;

  story_points: number;

  due_date: string | null;
  estimated_hours: number | null;
  actual_hours: number | null;

  created_at: string;
  updated_at: string;
}

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
  is_favourite: boolean;
  story_points: number;
  reporter_id: string;
  reporter_name: string;
  backlog_order: number;
  total_tasks: number;
  completed_tasks: number;
  progress: number;
  created_at: string;
  updated_at: string;
  tasks: UserStoryTask[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  role: string;
}

export interface TaskItem {
  id: string;
  project_id: string;
  sprint_id: string | null;
  sprint_name: string;
  user_story_id: string;
  user_story_title: string;
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
  created_at: string;
  updated_at: string;
  reporter: UserProfile;
  assignee: UserProfile;
}
