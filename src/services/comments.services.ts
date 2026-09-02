import { del, get, patch, post } from '../components/common/httpClient';
import {
  USERSTORIES_COMMENT,
  USERSTORIES_COMMENT_BY_ID,
  USER_STORIES_COMMENT_REPLIES,
  TASK_COMMENT,
  TASK_COMMENT_ID,
  TASK_COMMENT_REPLIES,
  POST_USERSTORY_COMMENT_ATTACHMENT,
  POST_TASK_COMMENT_ATTACHMENT,
} from '../constants/apiServiceEndpoint';
import {
  TaskCommentAttachmentResponse,
  UploadTaskCommentByTaskAttachmentParams,
  UploadUserStoryCommentAttachmentParams,
  UploadUserStoryCommentAttachmentResponse,
} from '../types/attachment.type';
import {
  CreateTaskCommentParams,
  CreateTaskCommentRequest,
  CreateTaskCommentResponse,
  CreateUserStoryCommentParams,
  CreateUserStoryCommentRequest,
  CreateUserStoryCommentResponse,
  DeleteCommentParams,
  DeleteCommentResponse,
  DeleteUserStoryCommentParams,
  DeleteUserStoryCommentResponse,
  GetTaskCommentRepliesParams,
  GetTaskCommentsParams,
  GetTaskCommentsResponse,
  GetUserStoryCommentByIdParams,
  GetUserStoryCommentByIdResponse,
  GetUserStoryCommentRepliesParams,
  GetUserStoryCommentRepliesResponse,
  GetUserStoryCommentsParams,
  GetUserStoryCommentsResponse,
  UpdateCommentParams,
  UpdateCommentResponse,
  UpdateUserStoryCommentParams,
  UpdateUserStoryCommentResponse,
} from '../types/comments.type';

export const getUserStoryCommentsService = async ({
  projectId,
  userStoryId,
  page = 1,
  pageSize = 10,
}: GetUserStoryCommentsParams): Promise<GetUserStoryCommentsResponse> => {
  try {
    if (!projectId || !userStoryId) {
      throw new Error(
        'Missing required route parameter: projectId or userStoryId',
      );
    }
    const url = USERSTORIES_COMMENT.replace('{project_id}', projectId).replace(
      '{user_story_id}',
      userStoryId,
    );

    return await get<GetUserStoryCommentsResponse>(url, {
      params: {
        page,
        page_size: pageSize,
      },
    });
  } catch (error) {
    console.error('Get User Story Comments API failed:', error);
    throw error;
  }
};

export const createUserStoryCommentService = async ({
  projectId,
  userStoryId,
  content,
  parentCommentId = null,
}: CreateUserStoryCommentParams): Promise<CreateUserStoryCommentResponse> => {
  try {
    if (!projectId || !userStoryId) {
      throw new Error(
        'Missing required route parameter: projectId or userStoryId',
      );
    }
    const url = USERSTORIES_COMMENT.replace('{project_id}', projectId).replace(
      '{user_story_id}',
      userStoryId,
    );
    const payload: CreateUserStoryCommentRequest = {
      content,
      parent_comment_id: parentCommentId,
    };

    return await post<CreateUserStoryCommentResponse>(url, payload);
  } catch (error) {
    console.error('Create User Story Comment API failed:', error);
    throw error;
  }
};

export const getUserStoryCommentByIdService = async ({
  projectId,
  userStoryId,
  commentId,
}: GetUserStoryCommentByIdParams): Promise<GetUserStoryCommentByIdResponse> => {
  try {
    if (!projectId || !userStoryId || !commentId) {
      throw new Error(
        'Missing required parameters: projectId, userStoryId, or commentId',
      );
    }
    const url = USERSTORIES_COMMENT_BY_ID.replace('{project_id}', projectId)
      .replace('{user_story_id}', userStoryId)
      .replace('{comment_id}', commentId);

    return await get<GetUserStoryCommentByIdResponse>(url);
  } catch (error) {
    console.error('Get User Story Comment By ID API failed:', error);
    throw error;
  }
};

export const updateUserStoryCommentService = async ({
  projectId,
  userStoryId,
  commentId,
  content,
}: UpdateUserStoryCommentParams): Promise<UpdateUserStoryCommentResponse> => {
  try {
    if (!projectId || !userStoryId || !commentId) {
      throw new Error(
        'Missing required parameters: projectId, userStoryId, or commentId',
      );
    }
    const url = USERSTORIES_COMMENT_BY_ID.replace('{project_id}', projectId)
      .replace('{user_story_id}', userStoryId)
      .replace('{comment_id}', commentId);

    return await patch<UpdateUserStoryCommentResponse>(url, { content });
  } catch (error) {
    console.error('Update User Story Comment API failed:', error);
    throw error;
  }
};

export const deleteUserStoryCommentService = async ({
  projectId,
  userStoryId,
  commentId,
}: DeleteUserStoryCommentParams): Promise<DeleteUserStoryCommentResponse> => {
  try {
    if (!projectId || !userStoryId || !commentId) {
      throw new Error(
        'Missing required parameters: projectId, userStoryId, or commentId',
      );
    }
    const url = USERSTORIES_COMMENT_BY_ID.replace('{project_id}', projectId)
      .replace('{user_story_id}', userStoryId)
      .replace('{comment_id}', commentId);

    return await del<DeleteUserStoryCommentResponse>(url);
  } catch (error) {
    console.error('Delete User Story Comment API failed:', error);
    throw error;
  }
};

export const getUserStoryCommentRepliesService = async ({
  projectId,
  userStoryId,
  commentId,
  page = 1,
  pageSize = 10,
}: GetUserStoryCommentRepliesParams): Promise<GetUserStoryCommentRepliesResponse> => {
  try {
    if (!projectId || !userStoryId || !commentId) {
      throw new Error(
        'Missing required parameters: projectId, userStoryId, or commentId',
      );
    }
    const url = USER_STORIES_COMMENT_REPLIES.replace('{project_id}', projectId)
      .replace('{user_story_id}', userStoryId)
      .replace('{comment_id}', commentId);

    return await get<GetUserStoryCommentRepliesResponse>(url, {
      params: {
        page,
        page_size: pageSize,
      },
    });
  } catch (error) {
    console.error('Get User Story Comment Replies API failed:', error);
    throw error;
  }
};

export const createTaskCommentService = async ({
  taskId,
  content,
  parentCommentId = null,
}: CreateTaskCommentParams): Promise<CreateTaskCommentResponse> => {
  try {
    if (!taskId) {
      throw new Error('Missing required route parameter: taskId');
    }
    const url = TASK_COMMENT.replace('{task_id}', taskId);
    const payload: CreateTaskCommentRequest = {
      content,
      parent_comment_id: parentCommentId,
    };

    return await post<CreateTaskCommentResponse>(url, payload);
  } catch (error) {
    console.error('Create Task Comment API failed:', error);
    throw error;
  }
};

export const getTaskCommentsService = async ({
  taskId,
  page = 1,
  pageSize = 10,
}: GetTaskCommentsParams): Promise<GetTaskCommentsResponse> => {
  try {
    if (!taskId) {
      throw new Error('Missing required parameter: taskId');
    }
    const url = TASK_COMMENT.replace('{task_id}', taskId);
    return await get<GetTaskCommentsResponse>(url, {
      params: {
        page,
        page_size: pageSize,
      },
    });
  } catch (error) {
    console.error('Get Task Comments API failed:', error);
    throw error;
  }
};

export const updateCommentService = async ({
  taskId,
  commentId,
  content,
}: UpdateCommentParams): Promise<UpdateCommentResponse> => {
  try {
    if (!taskId) {
      throw new Error('Missing required parameter: taskId');
    }
    if (!commentId) {
      throw new Error('Missing required parameter: commentId');
    }
    const url = TASK_COMMENT_ID.replace('{task_id}', taskId).replace(
      '{comment_id}',
      commentId,
    );
    return await patch<UpdateCommentResponse>(url, { content });
  } catch (error) {
    console.error('Update Comment API failed:', error);
    throw error;
  }
};

export const deleteTaskCommentService = async ({
  taskId,
  commentId,
}: DeleteCommentParams): Promise<DeleteCommentResponse> => {
  try {
    if (!taskId) {
      throw new Error('Missing required parameter: taskId');
    }
    if (!commentId) {
      throw new Error('Missing required parameter: commentId');
    }
    const url = TASK_COMMENT_ID.replace('{task_id}', taskId).replace(
      '{comment_id}',
      commentId,
    );
    return await del<DeleteCommentResponse>(url);
  } catch (error) {
    console.error('Delete Comment API failed:', error);
    throw error;
  }
};

export const getTaskCommentRepliesService = async ({
  taskId,
  parentCommentId,
  page = 1,
  pageSize = 10,
}: GetTaskCommentRepliesParams): Promise<GetTaskCommentsResponse> => {
  try {
    if (!taskId || !parentCommentId) {
      throw new Error('Missing required parameters: taskId or parentCommentId');
    }
    const url = TASK_COMMENT_REPLIES.replace('{task_id}', taskId).replace(
      '{parent_comment_id}',
      parentCommentId,
    );
    return await get<GetTaskCommentsResponse>(url, {
      params: {
        page,
        page_size: pageSize,
      },
    });
  } catch (error) {
    console.error('Get Task Comment Replies API failed:', error);
    throw error;
  }
};

export const uploadUserStoryCommentAttachmentService = async ({
  projectId,
  userStoryId,
  file,
}: UploadUserStoryCommentAttachmentParams): Promise<UploadUserStoryCommentAttachmentResponse> => {
  try {
    const url = POST_USERSTORY_COMMENT_ATTACHMENT.replace(
      '{project_id}',
      projectId,
    ).replace('{user_story_id}', userStoryId);

    const formData = new FormData();
    const fileUri = file.uri.startsWith('file://')
      ? file.uri
      : `file://${file.uri}`;
    formData.append('file', {
      uri: fileUri,
      name: file.name,
      type: file.type,
    } as any);

    return await post<UploadUserStoryCommentAttachmentResponse, FormData>(
      url,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
  } catch (error) {
    console.error('Upload User Story Comment Attachment API failed:', error);
    throw error;
  }
};

export const uploadTaskCommentAttachmentService = async ({
  taskId,
  file,
}: UploadTaskCommentByTaskAttachmentParams): Promise<TaskCommentAttachmentResponse> => {
  try {
    const url = POST_TASK_COMMENT_ATTACHMENT.replace('{task_id}', taskId);

    const formData = new FormData();
    const fileUri = file.uri.startsWith('file://')
      ? file.uri
      : `file://${file.uri}`;
    formData.append('file', {
      uri: fileUri,
      name: file.name,
      type: file.type,
    } as any);

    return await post<TaskCommentAttachmentResponse, FormData>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  } catch (error) {
    console.error('Upload Task Comment Attachment API failed:', error);
    throw error;
  }
};
