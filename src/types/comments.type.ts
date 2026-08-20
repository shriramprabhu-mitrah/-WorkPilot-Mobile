export interface GetUserStoryCommentsParams {
  projectId: string;
  userStoryId: string;
  page?: number;
  pageSize?: number;
}

export interface CommentMeta {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface GetUserStoryCommentsResponse {
  success: boolean;
  status_code: number;
  message: string;
  data: unknown[];
  meta: CommentMeta;
}

export interface CommentsState {
  comments: unknown[];
  meta: CommentMeta | null;
  loading: boolean;
  error: string | null;
}

export interface CreateTaskCommentRequest {
  content: string;
  parent_comment_id?: string | null;
}

export interface TaskCommentUserData {
  id: string;
  user_id: string;
  user_name: string;
  full_name: string;
  avatar_url: string | null;
}

export interface CreateTaskCommentResponse {
  success: boolean;
  status_code: number;
  message: string;
  data: TaskCommentUserData;
}

export interface CreateTaskCommentParams {
  taskId: string;
  content: string;
  parentCommentId?: string | null;
}

export interface GetTaskCommentsParams {
  taskId: string;
  page?: number;
  pageSize?: number;
}

export interface TaskCommentItem {
  id: string;
  task_id: string;
  user_id: string;
  user_name: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  content: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  replies_count: number;
}

export interface GetTaskCommentsResponse {
  success: boolean;
  status_code: number;
  message: string;
  data: TaskCommentItem[];
  meta: {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
  };
}

export interface UpdateCommentParams {
  taskId: string;
  commentId: string;
  content: string;
}

export interface UpdatedCommentUserData {
  id: string;
  user_id: string;
  user_name: string;
  full_name: string;
  avatar_url: string | null;
}

export interface UpdateCommentResponse {
  success: boolean;
  status_code: number;
  message: string;
  data: UpdatedCommentUserData;
}

export interface DeleteCommentParams {
  taskId: string;
  commentId: string;
}

export interface DeleteCommentResponse {
  success: boolean;
  status_code: number;
  message: string;
  data: {
    comment_id: string;
  };
}

export interface GetTaskCommentRepliesParams {
  taskId?: string;
  parentCommentId?: string;
  page?: number;
  pageSize?: number;
}
