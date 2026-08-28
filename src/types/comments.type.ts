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
  data: CommentItem[];
  meta: CommentMeta;
}

export interface CommentsState {
  comments: CommentItem[];
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
  parent_comment_id?: string | null;
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

export interface CommentItem {
  id: string;
  task_id?: string;
  user_story_id?: string;
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
  parent_comment_id?: string | null;
  retry_count?: number;
}

export interface GetTaskCommentsResponse {
  success: boolean;
  status_code: number;
  message: string;
  data: CommentItem[];
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

export interface CreateUserStoryCommentRequest {
  content: string;
  parent_comment_id?: string | null;
}

export interface UserStoryCommentUserData {
  id: string;
  user_id: string;
  user_name: string;
  full_name: string;
  avatar_url: string | null;
  parent_comment_id?: string | null;
}

export interface CreateUserStoryCommentResponse {
  success: boolean;
  status_code: number;
  message: string;
  data: UserStoryCommentUserData;
}

export interface CreateUserStoryCommentParams {
  projectId: string;
  userStoryId: string;
  content: string;
  parentCommentId?: string | null;
}

export interface GetUserStoryCommentByIdParams {
  projectId: string;
  userStoryId: string;
  commentId: string;
}

export interface GetUserStoryCommentByIdResponse {
  success: boolean;
  status_code: number;
  message: string;
  data: CommentItem[];
}

export interface UpdateUserStoryCommentParams {
  projectId: string;
  userStoryId: string;
  commentId: string;
  content: string;
}

export interface UpdateUserStoryCommentResponse {
  success: boolean;
  status_code: number;
  message: string;
  data: UpdatedCommentUserData;
}

export interface DeleteUserStoryCommentParams {
  projectId: string;
  userStoryId: string;
  commentId: string;
}

export interface DeleteUserStoryCommentResponse {
  success: boolean;
  status_code: number;
  message: string;
  data: {
    comment_id: string;
  };
}

export interface GetUserStoryCommentRepliesParams {
  projectId: string;
  userStoryId: string;
  commentId: string;
  page?: number;
  pageSize?: number;
}

export interface GetUserStoryCommentRepliesResponse {
  success: boolean;
  status_code: number;
  message: string;
  data: CommentItem[];
  meta: CommentMeta;
}
