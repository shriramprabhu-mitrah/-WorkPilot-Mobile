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
