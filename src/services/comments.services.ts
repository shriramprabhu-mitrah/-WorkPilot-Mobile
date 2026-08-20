import { del, get, patch, post } from '../components/common/httpClient';
import {
  GET_USERSTORIES_COMMENT,
  TASK_COMMENT,
  TASK_COMMENT_ID,
  TASK_COMMENT_REPLIES,
} from '../constants/apiServiceEndpoint';
import {
  CreateTaskCommentParams,
  CreateTaskCommentRequest,
  CreateTaskCommentResponse,
  DeleteCommentParams,
  DeleteCommentResponse,
  GetTaskCommentRepliesParams,
  GetTaskCommentsParams,
  GetTaskCommentsResponse,
  GetUserStoryCommentsParams,
  GetUserStoryCommentsResponse,
  UpdateCommentParams,
  UpdateCommentResponse,
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
    const url = GET_USERSTORIES_COMMENT.replace(
      '{project_id}',
      projectId,
    ).replace('{user_story_id}', userStoryId);

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
