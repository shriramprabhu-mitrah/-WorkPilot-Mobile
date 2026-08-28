import { ApiResponse } from './auth.type';

export interface Attachment {
  id: string;
  project_id?: string;
  user_story_id?: string;
  task_id?: string;
  comment_id?: string;
  original_filename: string;
  mime_type: string;
  file_size?: number;
  url?: string;
  uploaded_by?: string;
  uploaded_by_name?: string;
  uploaded_at?: string;
  updated_at?: string;
}

export interface GetUserStoryAttachmentsParams {
  projectId: string;
  userStoryId: string;
  isInitial?: boolean;
}

export interface GetUserStoryAttachmentsResponse extends ApiResponse {
  data: Attachment[];
}

export interface UploadUserStoryAttachmentParams {
  projectId: string;
  userStoryId: string;
  file: {
    uri: string;
    name: string;
    type: string;
  };
}

export interface UploadUserStoryAttachmentResponse extends ApiResponse {
  id: string;
  project_id?: string;
  user_story_id?: string;
  comment_id?: string;
  original_filename: string;
  mime_type: string;
  file_size?: number;
  url?: string;
  uploaded_by?: string;
  uploaded_by_name?: string;
  uploaded_at?: string;
  updated_at?: string;
}

export interface DeleteUserStoryAttachmentParams {
  projectId: string;
  userStoryId: string;
  attachmentId: string;
}

export interface DeleteAttachmentResult {
  success: boolean;
  status_code: number;
  message: string;
  attachmentId: string;
}

export interface DeleteUserStoryAttachmentResponse extends ApiResponse {
  attachmentId: string;
}

export interface DownloadUserStoryAttachmentParams {
  projectId: string;
  userStoryId: string;
  attachmentId: string;
}

export interface DownloadUserStoryAttachmentResponse extends ApiResponse {
  download_url?: string;
  file_url?: string;
}

export interface GetTaskCommentAttachmentsParams {
  projectId: string;
  taskId: string;
  isInitial?: boolean;
}

export interface GetTaskCommentAttachmentsResponse extends ApiResponse {
  data: Attachment[];
}

export interface UploadTaskCommentAttachmentParams {
  projectId: string;
  taskId: string;
  file: {
    uri: string;
    name: string;
    type: string;
  };
}

export interface UploadTaskCommentAttachmentResponse extends ApiResponse {
  id: string;
  project_id?: string;
  task_id?: string;
  comment_id?: string;
  original_filename: string;
  mime_type: string;
  file_size?: number;
  url?: string;
  uploaded_by?: string;
  uploaded_by_name?: string;
  uploaded_at?: string;
  updated_at?: string;
}

export interface DeleteTaskCommentAttachmentParams {
  projectId: string;
  taskId: string;
  attachmentId: string;
}

export interface DeleteTaskCommentAttachmentResponse extends ApiResponse {
  attachmentId: string;
}

export interface DownloadTaskCommentAttachmentParams {
  projectId: string;
  taskId: string;
  attachmentId: string;
}

export interface DownloadTaskCommentAttachmentResponse extends ApiResponse {
  download_url?: string;
  file_url?: string;
}

export type AttachmentUploadStatus = 'uploading' | 'uploaded' | 'failed';

export interface LocalAttachment {
  tempId: string;
  id?: string;
  serverId?: string;
  original_filename: string;
  localUri?: string;
  url?: string;
  download_url?: string;
  mime_type: string;
  file_size?: number;
  uploaded_by?: string;
  uploaded_by_name?: string;
  uploaded_at?: string;
  status: AttachmentUploadStatus;
  error?: string;
}

export interface VideoAttachment {
  id: string;
  uri: string;
  original_filename: string;
  mime_type: string;
  file_size?: number;
  type: 'video';
  uploaded_at?: string;
  uploaded_by_name?: string;
}

export interface AttachmentState {
  userStoryAttachments: Attachment[];
  taskCommentAttachments: Attachment[];
  localVideos: VideoAttachment[];
  loading: boolean;
  uploading: boolean;
  deleting: boolean;
  downloading: boolean;
  refreshing: boolean;
  error: string | null;
}
