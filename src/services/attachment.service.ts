import { del, get, post } from '../components/common/httpClient';
import {
  USATTACHMENT,
  DELETEUSATTACHMENT,
  GETUSATTACHMENTDOWNLOAD,
  TASKATTACHMENT,
  DELETETASKATTACHMENT,
  GETTASKATTACHMENTDOWNLOAD,
} from '../constants/apiServiceEndpoint';
import {
  GetUserStoryAttachmentsParams,
  GetUserStoryAttachmentsResponse,
  UploadUserStoryAttachmentParams,
  UploadUserStoryAttachmentResponse,
  DeleteUserStoryAttachmentParams,
  DeleteUserStoryAttachmentResponse,
  DownloadUserStoryAttachmentParams,
  DownloadUserStoryAttachmentResponse,
  GetTaskCommentAttachmentsParams,
  GetTaskCommentAttachmentsResponse,
  UploadTaskCommentAttachmentParams,
  UploadTaskCommentAttachmentResponse,
  DeleteTaskCommentAttachmentParams,
  DeleteTaskCommentAttachmentResponse,
  DownloadTaskCommentAttachmentParams,
  DownloadTaskCommentAttachmentResponse,
} from '../types/attachment.type';

export const getUserStoryAttachmentsService = async ({
  projectId,
  userStoryId,
}: GetUserStoryAttachmentsParams): Promise<GetUserStoryAttachmentsResponse> => {
  try {
    const url = USATTACHMENT.replace('{project_id}', projectId).replace(
      '{user_story_id}',
      userStoryId,
    );

    return await get<GetUserStoryAttachmentsResponse>(url);
  } catch (error) {
    console.error('Get User Story Attachments API failed:', error);
    throw error;
  }
};

export const uploadUserStoryAttachmentService = async ({
  projectId,
  userStoryId,
  file,
}: UploadUserStoryAttachmentParams): Promise<UploadUserStoryAttachmentResponse> => {
  try {
    const url = USATTACHMENT.replace('{project_id}', projectId).replace(
      '{user_story_id}',
      userStoryId,
    );

    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      name: file.name,
      type: file.type,
    } as any);

    return await post<UploadUserStoryAttachmentResponse, FormData>(
      url,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
  } catch (error) {
    console.error('Upload User Story Attachment API failed:', error);
    throw error;
  }
};

export const deleteUserStoryAttachmentService = async ({
  projectId,
  userStoryId,
  attachmentId,
}: DeleteUserStoryAttachmentParams): Promise<DeleteUserStoryAttachmentResponse> => {
  try {
    const url = DELETEUSATTACHMENT.replace('{project_id}', projectId)
      .replace('{user_story_id}', userStoryId)
      .replace('{attachment_id}', attachmentId);

    const response = await del<any>(url);
    return {
      ...response,
      attachmentId,
    };
  } catch (error) {
    console.error('Delete User Story Attachment API failed:', error);
    throw error;
  }
};

export const downloadUserStoryAttachmentService = async ({
  projectId,
  userStoryId,
  attachmentId,
}: DownloadUserStoryAttachmentParams): Promise<DownloadUserStoryAttachmentResponse> => {
  try {
    const url = GETUSATTACHMENTDOWNLOAD.replace('{project_id}', projectId)
      .replace('{user_story_id}', userStoryId)
      .replace('{attachment_id}', attachmentId);

    return await get<DownloadUserStoryAttachmentResponse>(url);
  } catch (error) {
    console.error('Download User Story Attachment API failed:', error);
    throw error;
  }
};

export const getTaskCommentAttachmentsService = async ({
  projectId,
  taskId,
}: GetTaskCommentAttachmentsParams): Promise<GetTaskCommentAttachmentsResponse> => {
  try {
    const url = TASKATTACHMENT.replace('{project_id}', projectId).replace(
      '{task_id}',
      taskId,
    );

    return await get<GetTaskCommentAttachmentsResponse>(url);
  } catch (error) {
    console.error('Get Task Comment Attachments API failed:', error);
    throw error;
  }
};

export const uploadTaskCommentAttachmentService = async ({
  projectId,
  taskId,
  file,
}: UploadTaskCommentAttachmentParams): Promise<UploadTaskCommentAttachmentResponse> => {
  try {
    const url = TASKATTACHMENT.replace('{project_id}', projectId).replace(
      '{task_id}',
      taskId,
    );

    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      name: file.name,
      type: file.type,
    } as any);

    return await post<UploadTaskCommentAttachmentResponse, FormData>(
      url,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
  } catch (error) {
    console.error('Upload Task Comment Attachment API failed:', error);
    throw error;
  }
};

export const deleteTaskCommentAttachmentService = async ({
  projectId,
  taskId,
  attachmentId,
}: DeleteTaskCommentAttachmentParams): Promise<DeleteTaskCommentAttachmentResponse> => {
  try {
    const url = DELETETASKATTACHMENT.replace('{project_id}', projectId)
      .replace('{task_id}', taskId)
      .replace('{attachment_id}', attachmentId);

    const response = await del<any>(url);
    return {
      ...response,
      attachmentId,
    };
  } catch (error) {
    console.error('Delete Task Comment Attachment API failed:', error);
    throw error;
  }
};

export const downloadTaskCommentAttachmentService = async ({
  projectId,
  taskId,
  attachmentId,
}: DownloadTaskCommentAttachmentParams): Promise<DownloadTaskCommentAttachmentResponse> => {
  try {
    const url = GETTASKATTACHMENTDOWNLOAD.replace('{project_id}', projectId)
      .replace('{task_id}', taskId)
      .replace('{attachment_id}', attachmentId);

    return await get<DownloadTaskCommentAttachmentResponse>(url);
  } catch (error) {
    console.error('Download Task Comment Attachment API failed:', error);
    throw error;
  }
};
